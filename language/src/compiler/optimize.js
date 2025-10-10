import { pathFromKeys, trailingSlash } from "@weborigami/async-tree";
import jsGlobals from "../project/jsGlobals.js";
import { entryKey } from "../runtime/expressionObject.js";
import { ops } from "../runtime/internal.js";
import { annotate, markers } from "./parserHelpers.js";

export const REFERENCE_PARAM = 1;
export const REFERENCE_INHERITED = 2;
export const REFERENCE_GLOBAL = 3;
export const REFERENCE_EXTERNAL = 4;

/**
 * Optimize an Origami code instruction:
 *
 * - Resolve local references to the appropriate context
 * - Resolve global references to the globals object
 * - Resolve other references to external values
 * - Determine whether x.y is a file name or property access
 * - Determine whether x/y is a file path or division operation
 *
 * @typedef {import("./parserHelpers.js").AnnotatedCode} AnnotatedCode
 * @typedef {import("./parserHelpers.js").Code} Code
 *
 * @param {AnnotatedCode} code
 * @param {any} options
 * @returns {AnnotatedCode}
 */
export default function optimize(code, options = {}) {
  const globals = options.globals ?? jsGlobals;
  const cache = options.cache === undefined ? {} : options.cache;
  const parent = options.parent ?? null;

  // The locals is an array, one item for each function or object context that
  // has been entered. The array grows to the right. Array items are objects
  // { type, names }, where type is REFERENCE_PARAM or REFERENCE_INHERITED
  // and names is an array of the variable names in that context.
  const locals = options.locals ? options.locals.slice() : [];

  // See if we can optimize this level of the code
  const [op, ...args] = code;
  switch (op) {
    case markers.global:
      // Replace with the indicated global
      return globals[args[0]];

    case markers.traverse:
      return resolvePath(code, globals, parent, locals, cache);

    case ops.lambda:
      const parameters = args[0];
      if (parameters.length > 0) {
        const paramNames = parameters.map((param) => param[1]);
        locals.push({
          type: REFERENCE_PARAM,
          names: paramNames,
        });
      }
      break;

    case ops.literal:
      return inlineLiteral(code);

    case ops.object:
      const entries = args;
      const propertyNames = entries.map((entry) => entryKey(entry));
      locals.push({
        type: REFERENCE_INHERITED,
        names: propertyNames,
      });
      break;
  }

  // Optimize children
  const optimized = annotate(
    code.map((child, index) => {
      // Don't optimize lambda parameter names
      if (op === ops.lambda && index === 1) {
        return child;
      } else if (op === ops.object && index > 0) {
        const [key, value] = child;
        const adjustedLocals = avoidLocalRecursion(locals, key);
        return annotate(
          [
            key,
            optimize(/** @type {AnnotatedCode} */ (value), {
              ...options,
              locals: adjustedLocals,
            }),
          ],
          child.location
        );
      } else if (Array.isArray(child) && "location" in child) {
        // Review: Aside from ops.object (above), what non-instruction arrays
        // does this descend into?
        return optimize(/** @type {AnnotatedCode} */ (child), {
          ...options,
          locals,
        });
      } else {
        return child;
      }
    }),
    code.location
  );

  return annotate(optimized, code.location);
}

// When defining a property named `key` (or `key/` or `(key)`), we need to
// remove any local variable with that name from the stack of locals to avoid a
// recursive reference.
function avoidLocalRecursion(locals, key) {
  if (key[0] === "(" && key[key.length - 1] === ")") {
    // Non-enumerable property, remove parentheses
    key = key.slice(1, -1);
  }

  const currentFrameIndex = locals.length - 1;
  if (locals[currentFrameIndex]?.type !== REFERENCE_INHERITED) {
    // Not an inherited context, nothing to do
    return locals;
  }

  // See if the key matches any of the local variable names in the current
  // context (ignoring trailing slashes)
  const matchingKeyIndex = locals[currentFrameIndex].names.findIndex(
    (name) =>
      // Ignore trailing slashes when comparing keys
      trailingSlash.remove(name) === trailingSlash.remove(key)
  );

  if (matchingKeyIndex >= 0) {
    // Remove the key from the current context's locals
    const adjustedLocals = locals.slice();
    const adjustedNames = adjustedLocals[currentFrameIndex].names.slice();
    adjustedNames.splice(matchingKeyIndex, 1);
    adjustedLocals[currentFrameIndex] = {
      type: REFERENCE_INHERITED,
      names: adjustedNames,
    };
    return adjustedLocals;
  } else {
    return locals;
  }
}

function cachePath(code, cache) {
  const keys = code.map(keyFromCode).filter((key) => key !== null);
  const path = pathFromKeys(keys);
  return annotate([ops.cache, cache, path, code], code.location);
}

// A reference with periods like x.y.z
function compoundReference(key, globals, locals, location) {
  const parts = key.split(".");
  if (parts.length === 1) {
    // Not a compound reference
    return null;
  }

  // Check first part to see if it's a global or local reference
  const [head, ...tail] = parts;
  const headReference = localOrGlobalReference(head, globals, locals, location);
  if (headReference === null) {
    // First part isn't global/local reference, so not a compound reference
    return null;
  }

  let result = headReference.result;

  // Process the remaining parts as property accesses
  while (tail.length > 0) {
    const part = tail.shift();
    result = annotate([ops.property, result, part], location);
  }

  return { type: headReference.type, result };
}

function externalReference(key, parent, location) {
  const scope = annotate([ops.scope, parent], location);
  const literal = annotate([ops.literal, key], location);
  return annotate([scope, literal], location);
}

function findLocalDetails(key, locals) {
  const normalized = trailingSlash.remove(key);
  let paramDepth = 0;
  let inheritedDepth = 0;
  for (let i = locals.length - 1; i >= 0; i--) {
    const { type, names } = locals[i];
    const local = names.find(
      (name) => trailingSlash.remove(name) === normalized
    );
    if (local) {
      const depth = type === REFERENCE_PARAM ? paramDepth : inheritedDepth;
      return { type, depth };
    }
    if (type === REFERENCE_PARAM) {
      paramDepth++;
    } else {
      inheritedDepth++;
    }
  }
  return null;
}

function globalReference(key, globals) {
  const normalized = trailingSlash.remove(key);
  return globals[normalized];
}

function inheritedReference(key, depth, location) {
  const literal = annotate([ops.literal, key], location);
  const inherited = annotate([ops.inherited, depth], location);
  return annotate([inherited, literal], location);
}

function inlineLiteral(code) {
  // If the literal value is an array, it's likely the strings array
  // of a template literal, so return it as is.
  return code[0] === ops.literal && !Array.isArray(code[1]) ? code[1] : code;
}

function keyFromCode(code) {
  const op = code instanceof Array ? code[0] : code;
  switch (op) {
    case ops.homeDirectory:
      return "~";

    case markers.external:
    case markers.global:
    case markers.reference:
    case ops.literal:
      return code[1];

    case ops.rootDirectory:
      return "/";

    default:
      return null;
  }
}

function localOrGlobalReference(key, globals, locals, location) {
  // Is key a local?
  const normalized = trailingSlash.remove(key);
  const localDetails = findLocalDetails(normalized, locals);
  if (localDetails) {
    const { type, depth } = localDetails;
    const result =
      type === REFERENCE_PARAM
        ? paramReference(key, depth, location)
        : inheritedReference(key, depth, location);
    return { type, result };
  }

  // Is key a global?
  if (normalized in globals) {
    return {
      type: REFERENCE_GLOBAL,
      result: globalReference(key, globals),
    };
  }

  return null;
}

function paramReference(key, depth, location) {
  const literal = annotate([ops.literal, key], location);
  const params = annotate([ops.params, depth], location);
  return annotate([params, literal], location);
}

function reference(code, globals, parent, locals) {
  const key = keyFromCode(code);
  const normalized = trailingSlash.remove(key);
  const location = code.location;

  if (normalized === "~") {
    // Special case for home directory
    return {
      type: REFERENCE_EXTERNAL,
      result: annotate([ops.homeDirectory], location),
    };
  } else if (normalized === "") {
    // Special case for root directory
    return {
      type: REFERENCE_EXTERNAL,
      result: annotate([ops.rootDirectory], location),
    };
  }

  if (code[0] === markers.external) {
    // Explicit external reference
    return {
      type: REFERENCE_EXTERNAL,
      result: externalReference(key, parent, location),
    };
  }

  // See if the whole key is a global or local variable
  const whole = localOrGlobalReference(key, globals, locals, location);
  if (whole) {
    return whole;
  }

  // Try key as a compound reference x.y.z
  const compound = compoundReference(key, globals, locals, location);
  if (compound) {
    return compound;
  }

  // Must be external
  return {
    type: REFERENCE_EXTERNAL,
    result: externalReference(key, parent, location),
  };
}

function resolvePath(code, globals, parent, locals, cache) {
  const args = code.slice(1);
  const [head, ...tail] = args;

  let { type, result } = reference(head, globals, parent, locals);

  if (tail.length > 0) {
    // If the result is a traversal, we can safely extend it
    const extendResult =
      result instanceof Array &&
      result[0] instanceof Array &&
      (result[0][0] === ops.scope ||
        result[0][0] === ops.params ||
        result[0][0] === ops.inherited);
    if (extendResult) {
      result.push(...tail);
    } else {
      result = annotate([result, ...tail], code.location);
    }
  }

  if (type === REFERENCE_EXTERNAL && cache !== null) {
    // Cache external path
    return cachePath(result, cache);
  }

  return result;
}
