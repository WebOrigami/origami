import { trailingSlash } from "@weborigami/async-tree";
import { ops } from "../runtime/internal.js";
import jsGlobals from "../runtime/jsGlobals.js";
import { annotate, markers } from "./parserHelpers.js";

/**
 * Optimize an Origami code instruction:
 *
 * - Transform any remaining reference references to scope references.
 * - Transform those or explicit ops.scope calls to ops.external calls unless
 *   they refer to local variables (variables defined by object literals or
 *   lambda parameters).
 *
 * @typedef {import("./parserHelpers.js").AnnotatedCode} AnnotatedCode
 * @typedef {import("./parserHelpers.js").Code} Code
 *
 * @param {AnnotatedCode} code
 * @param {any} options
 * @returns {AnnotatedCode}
 */
export default function optimize(code, options = {}) {
  const enableCaching = options.enableCaching ?? true;
  const globals = options.globals ?? jsGlobals;
  const mode = options.mode ?? "shell";
  const cache = options.cache ?? {};

  // The locals is an array, one item for each function or object context that
  // has been entered. The array grows to the right. The array items are
  // subarrays containing the names of local variables defined in that context.
  const locals = options.locals ? options.locals.slice() : [];

  const externalScope =
    mode === "shell"
      ? // External scope is parent scope + globals
        annotate(
          [ops.merge, globals, annotate([ops.scope], code.location)],
          code.location
        )
      : annotate([ops.scope], code.location);

  // See if we can optimize this level of the code
  const [fn, ...args] = code;
  let optimized = code;
  let isExternalReference = fn instanceof Array && fn[0] === ops.scope;
  switch (fn) {
    case markers.global:
      // Replace global op with the globals
      optimized = annotate([globals, args[0]], code.location);
      break;

    case ops.lambda:
      const parameters = args[0];
      if (parameters.length > 0) {
        const names = parameters.map((param) => param[1]);
        locals.push(names);
      }
      break;

    case ops.literal:
      const value = args[0];
      if (!(value instanceof Array)) {
        return value;
      }
      break;

    case ops.object:
      const entries = args;
      const keys = entries.map(([key]) => propertyName(key));
      locals.push(keys);
      break;

    case markers.path:
      // Resolve ambiguous path or division chain by examining the key at the
      // head of the path.
      {
        const key = args[0][0][1];
        const isHeadVariable =
          key in globals || getLocalReferenceDepth(locals, key) >= 0;
        return isHeadVariable
          ? divisionChain(args, globals, locals, code.location)
          : externalPath(args, enableCaching, code.location);
      }
      break;

    case markers.reference:
      // Determine whether reference is local and, if so, transform to
      // ops.local call. Otherwise transform to ops.scope call.
      {
        let key = args[0];
        if (key instanceof Array && key[0] === ops.literal) {
          key = key[1];
        }
        const normalizedKey = trailingSlash.remove(key);
        let target;
        const depth = getLocalReferenceDepth(locals, normalizedKey);
        if (depth >= 0) {
          // Transform local reference
          const contextCode = [ops.context];
          if (depth > 0) {
            contextCode.push(depth);
          }
          target = annotate(contextCode, code.location);
        } else if (mode === "shell") {
          // Transform non-local reference
          target = externalScope;
          isExternalReference = true;
        } else if (mode === "jse") {
          target = globals;
        }
        optimized = annotate([target, ...args], code.location);
      }
      break;

    case ops.scope:
      {
        const depth = locals.length;
        if (depth === 0) {
          // Use scope call as is
          optimized = code;
        } else {
          // Add context for appropriate depth to scope call
          const contextCode = annotate([ops.context, depth], code.location);
          optimized = annotate([ops.scope, contextCode], code.location);
        }
      }
      break;
  }

  // Optimize children
  optimized = annotate(
    optimized.map((child, index) => {
      // Don't optimize lambda parameter names
      if (fn === ops.lambda && index === 1) {
        return child;
      } else if (fn === ops.object && index > 0) {
        // Code that defines a property `x` that contains references to `x`
        // shouldn't find this context but look further up.
        const [key, value] = child;
        const normalizedKey = trailingSlash.remove(key);
        let adjustedLocals;
        if (locals.at(-1)?.includes(normalizedKey)) {
          adjustedLocals = locals.slice();
          // Remove the key from the current context's locals
          adjustedLocals[adjustedLocals.length - 1] = locals
            .at(-1)
            .filter((name) => name !== normalizedKey);
        } else {
          adjustedLocals = locals;
        }
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

  // Cache external scope or merged globals + scope references
  // if (enableCaching && isExternalReference) {
  //   // Get all the keys so we can construct a path as a cache key
  //   const keys = optimized
  //     .slice(1)
  //     .map((arg) =>
  //       typeof arg === "string" || typeof arg === "number"
  //         ? arg
  //         : arg instanceof Array && arg[0] === ops.literal
  //         ? arg[1]
  //         : null
  //     );
  //   if (keys.some((key) => key === null)) {
  //     throw new Error("Internal error: scope reference with non-literal key");
  //   }
  //   const path = pathFromKeys(keys);
  //   optimized = annotate(
  //     [ops.cache, cache, path, optimized],
  //     optimized.location
  //   );
  // }

  return annotate(optimized, code.location);
}

function divisionChain(args, globals, locals, location) {
  const [first, ...rest] = args;
  let result = propertyChain(first, globals, locals);
  for (const segment of rest) {
    const property = propertyChain(segment, globals, locals);
    result = annotate([ops.division, result, property], segment.location);
  }
  return result;
}

function externalPath(args, enableCaching, location) {
  let lookup = ops.scope;
  let path = "";
  for (let i = 0; i < args.length; i++) {
    const segments = args[i];
    const texts = segments.map((segment) => segment[1]);
    const key = trailingSlash.toggle(texts.join("."), i < args.length - 1);
    path += key;
    const location = { ...segments[0].location };
    location.end = segments[segments.length - 1].location.end;
    lookup = annotate([lookup, key], location);
  }
  return enableCaching
    ? annotate([ops.cache, {}, path, lookup], location)
    : lookup;
}

// Determine how many contexts up we need to go for a local
function getLocalReferenceDepth(locals, key) {
  const contextIndex = locals.findLastIndex((names) => names.includes(key));
  if (contextIndex < 0) {
    return -1; // Not a local reference
  }
  const depth = locals.length - contextIndex - 1;
  return depth;
}

function propertyChain(segments, globals, locals) {
  const [first, ...rest] = segments;
  let call = target(first, globals, locals);
  for (const segment of rest) {
    const key = segment[1];
    call = annotate([call, key], segment.location);
  }
  return call;
}

function propertyName(key) {
  if (key[0] === "(" && key[key.length - 1] === ")") {
    // Non-enumerable property, remove parentheses
    key = key.slice(1, -1);
  }
  return trailingSlash.remove(key);
}

function target(literal, globals, locals) {
  const key = literal[1];
  const call =
    key in globals
      ? [globals, key]
      : [ops.context, getLocalReferenceDepth(locals, key)];
  return annotate(call, literal.location);
}
