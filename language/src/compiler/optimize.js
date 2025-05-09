import { pathFromKeys, scope, trailingSlash } from "@weborigami/async-tree";
import { ops } from "../runtime/internal.js";
import { annotate, undetermined } from "./parserHelpers.js";

/**
 * Optimize an Origami code instruction:
 *
 * - Transform any remaining undetermined references to scope references.
 * - Transform those or explicit ops.scope calls to ops.external calls unless
 *   they refer to local variables (variables defined by object literals or
 *   lambda parameters).
 * - Apply any macros to the code.
 *
 * @typedef {import("./parserHelpers.js").AnnotatedCode} AnnotatedCode
 * @typedef {import("./parserHelpers.js").Code} Code
 *
 * @param {AnnotatedCode} code
 * @param {import("@weborigami/types").AsyncTree|null} fileParent
 * @param {boolean} enableCaching
 * @param {Record<string, AnnotatedCode>} macros
 * @param {Record<string, AnnotatedCode>} cache
 * @param {Record<string, number>} locals
 * @returns {AnnotatedCode}
 */
export default function optimize(
  code,
  fileParent = null,
  enableCaching = true,
  macros = {},
  cache = {},
  locals = {}
) {
  const parentScope = fileParent && scope(fileParent);

  // See if we can optimize this level of the code
  const [fn, ...args] = code;
  const key = args[0];
  let additionalLocalNames;
  switch (fn) {
    case ops.external:
      // External reference found by compiler, add scope and cache
      if (enableCaching) {
        return annotate(
          [
            ops.external,
            key,
            annotate([parentScope, key], code.location),
            cache,
          ],
          code.location
        );
      } else {
        // Downgrade to regular scope reference
        return annotate([ops.scope, key], code.location);
      }
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

    case ops.merge:
      // Will increase the depth, pretend it has empty array of locals
      additionalLocalNames = [];
      break;

    case ops.object:
      const entries = args;
      additionalLocalNames = entries.map(([key]) => {
        if (key[0] === "(" && key[key.length - 1] === ")") {
          // Non-enumerable property, remove parentheses
          key = key.slice(1, -1);
        }
        return trailingSlash.remove(key);
      });
      break;

    // Both of these are handled the same way
    case undetermined:
    case ops.scope:
      const normalizedKey = trailingSlash.remove(key);
      if (macros?.[normalizedKey]) {
        // Apply macro
        const macro = macros?.[normalizedKey];
        return applyMacro(
          macro,
          code,
          fileParent,
          enableCaching,
          macros,
          cache,
          locals
        );
      } else if (
        enableCaching &&
        parentScope &&
        locals[normalizedKey] === undefined
      ) {
        // Upgrade to cached external scope reference
        return annotate(
          [
            ops.external,
            key,
            annotate([parentScope, key], code.location),
            cache,
          ],
          code.location
        );
      } else if (locals[normalizedKey] !== undefined) {
        // Transform local reference to ops.local
        const localIndex = locals[normalizedKey];
        return annotate([ops.local, localIndex, key], code.location);
      } else if (fn === undetermined) {
        // Transform undetermined reference to regular scope call
        return annotate([ops.scope, key], code.location);
      } else {
        // Internal ops.scope call; leave as is
        return code;
      }

    case ops.traverse:
      // Is the first argument a nonscope/undetermined reference?
      const isScopeRef =
        args[0]?.[0] === ops.scope || args[0]?.[0] === undetermined;
      if (enableCaching && isScopeRef) {
        // Is the first argument a nonlocal reference?
        const normalizedKey = trailingSlash.remove(args[0][1]);
        if (locals[normalizedKey] === undefined) {
          // Are the remaining arguments all literals?
          const allLiterals = args
            .slice(1)
            .every((arg) => arg[0] === ops.literal);
          if (allLiterals) {
            // Convert to ops.external
            const keys = args.map((arg) => arg[1]);
            const path = pathFromKeys(keys);
            /** @type {Code} */
            const optimized = [ops.external, path, code, cache];
            return annotate(optimized, code.location);
          }
        }
      }
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
  const optimized = code.map((child, index) => {
    // Don't optimize lambda parameter names
    if (fn === ops.lambda && index === 1) {
      return child;
    } else if (Array.isArray(child) && "location" in child) {
      // Review: This currently descends into arrays that are not instructions,
      // such as the entries of an ops.object. This should be harmless, but it'd
      // be preferable to only descend into instructions. This would require
      // surrounding ops.object entries with ops.array.
      return optimize(
        /** @type {AnnotatedCode} */ (child),
        fileParent,
        enableCaching,
        macros,
        cache,
        updatedLocals
      );
    } else {
      return child;
    }
  });

  return annotate(optimized, code.location);
}

function applyMacro(
  macro,
  code,
  fileParent,
  enableCaching,
  macros,
  cache,
  locals
) {
  const optimized = optimize(
    macro,
    fileParent,
    enableCaching,
    macros,
    cache,
    locals
  );
  return optimized instanceof Array
    ? annotate(optimized, code.location)
    : optimized;
}
