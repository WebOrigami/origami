import { pathFromKeys, trailingSlash } from "@weborigami/async-tree";
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
 */
export default function optimize(
  code,
  enableCaching = true,
  macros = {},
  cache = {},
  locals = {}
) {
  // See if we can optimize this level of the code
  const [fn, ...args] = code;
  let additionalLocalNames;
  switch (fn) {
    case ops.lambda:
      const parameters = args[0];
      additionalLocalNames = parameters;
      break;

    case ops.literal:
      const value = args[0];
      if (!(value instanceof Array)) {
        return value;
      }
      break;

    case ops.object:
      const entries = args;
      additionalLocalNames = entries.map(([key]) => trailingSlash.remove(key));
      break;

    // Both of these are handled the same way
    case undetermined:
    case ops.scope:
      const key = args[0];
      const normalizedKey = trailingSlash.remove(key);
      if (macros?.[normalizedKey]) {
        // Apply macro
        const macro = macros?.[normalizedKey];
        return applyMacro(macro, code, enableCaching, macros, cache, locals);
      } else if (enableCaching && !locals[normalizedKey]) {
        // Upgrade to cached external scope reference
        const optimized = [ops.external, key, [ops.scope, key], cache];
        // @ts-ignore
        annotate(optimized, code.location);
        return optimized;
      } else if (fn === undetermined) {
        // Transform undetermined reference to regular scope call
        const optimized = [ops.scope, key];
        // @ts-ignore
        annotate(optimized, code.location);
        return optimized;
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
        if (!locals[normalizedKey]) {
          // Are the remaining arguments all literals?
          const allLiterals = args
            .slice(1)
            .every((arg) => arg[0] === ops.literal);
          if (allLiterals) {
            // Convert to ops.external
            const keys = args.map((arg) => arg[1]);
            const path = pathFromKeys(keys);
            const optimized = [ops.external, path, code, cache];
            // @ts-ignore
            annotate(optimized, code.location);
            return optimized;
          }
        }
      }
      break;
  }

  // Add any locals introduced by this code to the list that will be consulted
  // when we descend into child nodes.
  let updatedLocals;
  if (additionalLocalNames) {
    updatedLocals = { ...locals };
    for (const key of additionalLocalNames) {
      updatedLocals[key] = true;
    }
  } else {
    updatedLocals = locals;
  }

  // Optimize children
  const optimized = code.map((child) => {
    if (Array.isArray(child)) {
      // Review: This currently descends into arrays that are not instructions,
      // such as the parameters of a lambda. This should be harmless, but it'd
      // be preferable to only descend into instructions. This would require
      // surrounding ops.lambda parameters with ops.literal, and ops.object
      // entries with ops.array.
      return optimize(child, enableCaching, macros, cache, updatedLocals);
    } else {
      return child;
    }
  });

  if (code.location) {
    annotate(optimized, code.location);
  }
  return optimized;
}

function applyMacro(macro, code, enableCaching, macros, cache, locals) {
  const optimized = optimize(macro, enableCaching, macros, cache, locals);
  // @ts-ignore
  annotate(optimized, code.location);
  return optimized;
}
