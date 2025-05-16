import { pathFromKeys, trailingSlash } from "@weborigami/async-tree";
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
  const locals = options.locals ?? {};

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
  const key = args[0];
  let additionalLocalNames;
  let optimized = code;
  let externalReference = fn instanceof Array && fn[0] === ops.scope;
  switch (fn) {
    case markers.global:
      // Replace global op with the globals
      optimized = annotate([globals, key], code.location);
      break;

    case ops.lambda:
      const parameters = args[0];
      if (parameters.length > 0) {
        additionalLocalNames = parameters.map((param) => param[1]);
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
      additionalLocalNames = entries.map(([key]) => propertyName(key));
      break;

    case markers.reference:
      // Determine whether reference is local and, if so, transform to
      // ops.local call. Otherwise transform to ops.scope call.
      const normalizedKey = trailingSlash.remove(key[1]);
      let target;
      if (locals[normalizedKey] !== undefined) {
        // Transform local reference
        const localIndex = locals[normalizedKey];
        const contextCode = [ops.context];
        if (localIndex > 0) {
          contextCode.push(localIndex);
        }
        target = annotate(contextCode, code.location);
      } else if (mode === "shell") {
        // Transform non-local reference
        target = externalScope;
        externalReference = true;
      } else if (mode === "jse") {
        target = globals;
      }
      optimized = annotate([target, ...args], code.location);
      break;
  }

  // Add any locals introduced by this code to the list that will be consulted
  // when we descend into child nodes.
  /** @type {Record<string, number>} */
  let updatedLocals;
  if (additionalLocalNames === undefined) {
    updatedLocals = locals;
  } else {
    updatedLocals = {};
    for (const key in locals) {
      updatedLocals[key] = locals[key] + 1;
    }
    for (const key of additionalLocalNames) {
      updatedLocals[key] = 0;
    }
  }

  // Optimize children
  optimized = annotate(
    optimized.map((child, index) => {
      // Don't optimize lambda parameter names
      if (fn === ops.lambda && index === 1) {
        return child;
      } else if (Array.isArray(child) && "location" in child) {
        // Review: This currently descends into arrays that are not instructions,
        // such as the entries of an ops.object. This should be harmless, but it'd
        // be preferable to only descend into instructions. This would require
        // surrounding ops.object entries with ops.array.
        return optimize(/** @type {AnnotatedCode} */ (child), {
          ...options,
          locals: updatedLocals,
        });
      } else {
        return child;
      }
    }),
    optimized.location
  );

  // Cache external scope or merged globals + scope references
  if (enableCaching && externalReference) {
    // Get all the keys so we can construct a path as a cache key
    const keys = optimized
      .slice(1)
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : arg instanceof Array && arg[0] === ops.literal
          ? arg[1]
          : null
      );
    if (keys.some((key) => key === null)) {
      throw new Error("Internal error: scope reference with non-literal key");
    }
    const path = pathFromKeys(keys);
    optimized = annotate(
      [ops.cache, cache, path, optimized],
      optimized.location
    );
  }

  return annotate(optimized, code.location);
}

function propertyName(key) {
  if (key[0] === "(" && key[key.length - 1] === ")") {
    // Non-enumerable property, remove parentheses
    key = key.slice(1, -1);
  }
  return trailingSlash.remove(key);
}
