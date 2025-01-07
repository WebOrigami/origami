import { trailingSlash } from "@weborigami/async-tree";
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
  enableCaching,
  macros,
  cache = {},
  locals = {}
) {
  // See if we can optimize this level of the code
  const [fn, ...args] = code;
  let additionalLocalNames;
  switch (fn) {
    case undetermined:
    case ops.scope:
      const key = args[0];
      const normalizedKey = trailingSlash.remove(key);
      if (macros?.[normalizedKey]) {
        // Apply macro
        const macro = macros?.[normalizedKey];
        return applyMacro(macro, code, enableCaching, macros, cache, locals);
      } else if (enableCaching && !locals[normalizedKey]) {
        // Upgrade to cached external reference
        const modified = [ops.external, key, cache];
        // @ts-ignore
        annotate(modified, code.location);
        return modified;
      } else if (fn === undetermined) {
        // Transform undetermined reference to regular scope call
        const modified = [ops.scope, key];
        // @ts-ignore
        annotate(modified, code.location);
        return modified;
      } else {
        // Internal ops.scope call; leave as is
        return code;
      }

    case ops.lambda:
      const parameters = args[0];
      additionalLocalNames = parameters;
      break;

    case ops.object:
      const entries = args;
      additionalLocalNames = entries.map(([key]) => trailingSlash.remove(key));
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
