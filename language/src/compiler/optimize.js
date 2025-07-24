import { pathFromKeys, trailingSlash } from "@weborigami/async-tree";
import { entryKey } from "../runtime/expressionObject.js";
import { ops } from "../runtime/internal.js";
import jsGlobals from "../runtime/jsGlobals.js";
import { annotate, markers } from "./parserHelpers.js";

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
  const mode = options.mode ?? "shell";

  // The locals is an array, one item for each function or object context that
  // has been entered. The array grows to the right. The array items are
  // subarrays containing the names of local variables defined in that context.
  const locals = options.locals ? options.locals.slice() : [];

  // See if we can optimize this level of the code
  const [op, ...args] = code;
  let optimized = code;
  switch (op) {
    case markers.global:
      // Replace global op with the globals
      return annotate([globals, args[0]], code.location);

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

    case ops.scope:
      optimized = scopeCall(locals, code.location);
      break;
  }

  if (op === markers.reference) {
    return resolveReference(code, globals, locals, cache);
  } else if (op instanceof Array && op[0] === markers.reference) {
    optimized = resolvePath(code, globals, locals, cache, mode);
  }

  // Optimize children
  optimized = annotate(
    optimized.map((child, index) => {
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
    optimized.location
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

function cacheResult(cache, code) {
  if (cache === null) {
    // No cache, return as is
    return code;
  }

  const args = code.slice(1);
  const keys = args.map((arg) =>
    typeof arg === "string" || typeof arg === "number"
      ? arg
      : arg instanceof Array && arg[0] === ops.literal
      ? arg[1]
      : null
  );
  if (keys.some((key) => key === null)) {
    throw new Error("Internal error: scope reference with non-literal key");
  }
  return annotate([ops.cache, cache, pathFromKeys(keys), code], code.location);
}

function externalReference(code, locals, cache) {
  const key = keyFromCode(code);
  const scope = scopeCall(locals, code.location);
  return annotate([scope, key], code.location);
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

function inlineLiteral(code) {
  // If the literal value is an array, it's likely the strings array
  // of a template literal, so return it as is.
  return code[0] === ops.literal && !Array.isArray(code[1]) ? code[1] : code;
}

function isExternalReference(code, globals, locals) {
  const key = keyFromCode(code);

  // See if the whole key is a global or local variable
  if (isVariable(key, globals, locals)) {
    return false; // Global or local variable
  }

  // Split by periods
  const parts = key.split(".");
  if (parts.length === 1) {
    return true; // External reference
  }

  // Check first part to see if it's a global or local reference
  if (isVariable(parts[0], globals, locals)) {
    return false; // Global or local variable
  }

  return true; // external reference
}

function isVariable(key, globals, locals) {
  // Check if the key is a global variable
  if (key in globals) {
    return true;
  } else if (getLocalReferenceDepth(locals, key) >= 0) {
    return true; // local variable
  }
  return false; // not a variable
}

function keyFromCode(code) {
  return code[1];
}

function resolvePath(code, globals, locals, cache, mode) {
  const [head, ...tail] = code;

  // In JSE mode, all paths start with an external reference
  const isExternal =
    mode === "jse" || isExternalReference(head, globals, locals);
  let result = isExternal
    ? externalReference(head, locals, cache)
    : variableReference(head, globals, locals);

  result.push(...tail);

  if (isExternal) {
    // Cache external paths
    result = cacheResult(cache, result);
  }

  return result;
}

function resolveReference(code, globals, locals, cache) {
  const isExternal = isExternalReference(code, globals, locals);
  let result = isExternal
    ? externalReference(code, locals, cache)
    : variableReference(code, globals, locals);
  if (isExternal) {
    // Cache external references
    result = cacheResult(cache, result);
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

function variableReference(code, globals, locals) {
  const key = trailingSlash.remove(keyFromCode(code));

  const parts = key.split(".");
  const [head, ...tail] = parts;

  let result;
  const depth = getLocalReferenceDepth(locals, head);
  if (depth < 0) {
    // Not local, so global
    result = annotate([globals, head], code.location);
  } else {
    const context = [ops.context];
    if (depth > 0) {
      context.push(depth);
    }
    const contextCall = annotate(context, code.location);
    result = annotate([contextCall, head], code.location);
  }

  while (tail.length > 0) {
    const part = tail.shift();
    result = annotate([result, part], code.location);
  }

  return result;
}
