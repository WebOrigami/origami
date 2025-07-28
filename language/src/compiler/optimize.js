import { pathFromKeys, trailingSlash } from "@weborigami/async-tree";
import { entryKey } from "../runtime/expressionObject.js";
import { ops } from "../runtime/internal.js";
import jsGlobals from "../runtime/jsGlobals.js";
import { annotate, markers } from "./parserHelpers.js";

const REFERENCE_LOCAL = 1;
const REFERENCE_GLOBAL = 2;
const REFERENCE_EXTERNAL = 3;

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
  const cache = options.cache ?? {};

  // The locals is an array, one item for each function or object context that
  // has been entered. The array grows to the right. The array items are
  // subarrays containing the names of local variables defined in that context.
  const locals = options.locals ? options.locals.slice() : [];

  // See if we can optimize this level of the code
  const [op, ...args] = code;
  switch (op) {
    case markers.global:
      // Replace global op with the globals
      return annotate([globals, args[0]], code.location);

    case markers.traverse:
      return resolvePath(code, globals, locals, cache);

    case ops.lambda:
      const parameters = args[0];
      if (parameters.length > 0) {
        const names = parameters.map((param) => param[1]);
        locals.push(names);
      }
      break;

    case ops.literal:
      return inlineLiteral(code);

    case ops.object:
      const entries = args;
      const keys = entries.map(entryKey);
      locals.push(keys);
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
        return [
          key,
          optimize(/** @type {AnnotatedCode} */ (value), {
            ...options,
            locals: adjustedLocals,
          }),
        ];
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

  const currentFrame = locals.length - 1;
  const matchingKeyIndex = locals[currentFrame].findIndex(
    (localKey) =>
      // Ignore trailing slashes when comparing keys
      trailingSlash.remove(localKey) === trailingSlash.remove(key)
  );

  if (matchingKeyIndex >= 0) {
    // Remove the key from the current context's locals
    const adjustedLocals = locals.slice();
    adjustedLocals[currentFrame] = adjustedLocals[currentFrame].slice();
    adjustedLocals[currentFrame].splice(matchingKeyIndex, 1);
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
    return { type: REFERENCE_EXTERNAL, result: null };
  }

  // Check first part to see if it's a global or local reference
  const [head, ...tail] = parts;
  const type = referenceType(head, globals, locals);
  let result;
  if (type === REFERENCE_GLOBAL) {
    result = globalReference(head, globals, location);
  } else if (type === REFERENCE_LOCAL) {
    result = localReference(head, locals, location);
  } else {
    // Not a compound reference
    return { type: REFERENCE_EXTERNAL, result: null };
  }

  // Process the remaining parts as property accesses
  while (tail.length > 0) {
    const part = tail.shift();
    result = annotate([result, part], location);
  }

  return { type, result };
}

function externalReference(key, locals, location) {
  const scope = scopeCall(locals, location);
  const literal = annotate([ops.literal, key], location);
  return annotate([scope, literal], location);
}

// Determine how many contexts up we need to go for a local
function getLocalReferenceDepth(locals, key) {
  const contextIndex = locals.findLastIndex((names) =>
    names.some(
      (name) => trailingSlash.remove(name) === trailingSlash.remove(key)
    )
  );
  if (contextIndex < 0) {
    return -1; // Not a local reference
  }
  const depth = locals.length - contextIndex - 1;
  return depth;
}

function globalReference(key, globals, location) {
  const normalized = trailingSlash.remove(key);
  return annotate([globals, normalized], location);
}

function inlineLiteral(code) {
  // If the literal value is an array, it's likely the strings array
  // of a template literal, so return it as is.
  return code[0] === ops.literal && !Array.isArray(code[1]) ? code[1] : code;
}

function localReference(key, locals, location) {
  const normalized = trailingSlash.remove(key);
  const depth = getLocalReferenceDepth(locals, normalized);
  const context = [ops.context];
  if (depth > 0) {
    context.push(depth);
  }
  const contextCall = annotate(context, location);
  const literal = annotate([ops.literal, key], location);
  return annotate([contextCall, literal], location);
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

function reference(code, globals, locals) {
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
      result: externalReference(key, locals, location),
    };
  }

  // See if the whole key is a global or local variable
  let type = referenceType(key, globals, locals);
  let result;
  if (type === REFERENCE_GLOBAL) {
    result = globalReference(key, globals, location);
  } else if (type === REFERENCE_LOCAL) {
    result = localReference(key, locals, location);
  } else {
    // Try key as a compound reference x.y.z
    const compound = compoundReference(key, globals, locals, location);
    result = compound?.result;
    type = compound?.type;
  }

  if (!result) {
    // If none of the above worked, it must be an external reference
    result = externalReference(key, locals, location);
  }

  return { type, result };
}

function referenceType(key, globals, locals) {
  // Check if the key is a global variable
  const normalized = trailingSlash.remove(key);
  if (getLocalReferenceDepth(locals, normalized) >= 0) {
    return REFERENCE_LOCAL;
  } else if (normalized in globals) {
    return REFERENCE_GLOBAL;
  } else {
    return REFERENCE_EXTERNAL;
  }
}

function resolvePath(code, globals, locals, cache) {
  const args = code.slice(1);
  const [head, ...tail] = args;

  let { type, result } = reference(head, globals, locals);

  result.push(...tail);

  if (type === REFERENCE_EXTERNAL && cache !== null) {
    // Cache external path
    return cachePath(result, cache);
  }

  return result;
}

function scopeCall(locals, location) {
  const depth = locals.length;
  const code = [ops.scope];
  if (depth > 0) {
    // Add context for appropriate depth to scope call
    const contextCode = annotate([ops.context, depth], location);
    code.push(contextCode);
  }
  return annotate(code, location);
}
