import { trailingSlash } from "@weborigami/async-tree";
import { createExpressionFunction } from "../runtime/expressionFunction.js";
import { ops } from "../runtime/internal.js";
import { parse } from "./parse.js";

function compile(source, startRule) {
  if (typeof source === "string") {
    source = { text: source };
  }
  const code = parse(source.text, {
    grammarSource: source,
    startRule,
  });
  const modified = cacheNonLocalScopeReferences(code);
  // const modified = code;
  const fn = createExpressionFunction(modified);
  return fn;
}

export function expression(source) {
  return compile(source, "expression");
}

// Given code containing ops.scope calls, upgrade them to ops.cache calls unless
// they refer to local variables: variables defined by object literals or lambda
// parameters.
export function cacheNonLocalScopeReferences(code, locals = {}) {
  const [fn, ...args] = code;

  let additionalLocalNames;
  switch (fn) {
    case ops.scope:
      const key = args[0];
      const normalizedKey = trailingSlash.remove(key);
      if (locals[normalizedKey]) {
        return code;
      } else {
        // Upgrade to cached scope lookup
        const modified = [ops.cache, key];
        /** @type {any} */ (modified).location = code.location;
        return modified;
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

  let updatedLocals = { ...locals };
  if (additionalLocalNames) {
    for (const key of additionalLocalNames) {
      updatedLocals[key] = true;
    }
  }

  const modified = code.map((child) => {
    if (Array.isArray(child)) {
      // Review: This currently descends into arrays that are not instructions,
      // such as the parameters of a lambda. This should be harmless, but it'd
      // be preferable to only descend into instructions. This would require
      // surrounding ops.lambda parameters with ops.literal, and ops.object
      // entries with ops.array.
      return cacheNonLocalScopeReferences(child, updatedLocals);
    } else {
      return child;
    }
  });

  if (code.location) {
    modified.location = code.location;
  }
  return modified;
}

export function templateDocument(source) {
  return compile(source, "templateDocument");
}
