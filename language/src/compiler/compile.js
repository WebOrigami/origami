import { trailingSlash } from "@weborigami/async-tree";
import { createExpressionFunction } from "../runtime/expressionFunction.js";
import { ops } from "../runtime/internal.js";
import { parse } from "./parse.js";
import { annotate, undetermined } from "./parserHelpers.js";

function compile(source, options) {
  const { startRule } = options;
  const enableCaching = options.scopeCaching ?? true;
  if (typeof source === "string") {
    source = { text: source };
  }
  const code = parse(source.text, {
    grammarSource: source,
    startRule,
  });
  const cache = {};
  const modified = transformScopeReferences(code, cache, enableCaching);
  const fn = createExpressionFunction(modified);
  return fn;
}

export function expression(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "expression",
  });
}

// Transform any remaining undetermined references to scope references. At the
// same time, transform those or explicit ops.scope calls to ops.external calls
// unless they refer to local variables (variables defined by object literals or
// lambda parameters).
export function transformScopeReferences(
  code,
  cache,
  enableCaching,
  locals = {}
) {
  const [fn, ...args] = code;

  let additionalLocalNames;
  switch (fn) {
    case undetermined:
    case ops.scope:
      const key = args[0];
      const normalizedKey = trailingSlash.remove(key);
      if (enableCaching && !locals[normalizedKey]) {
        // Upgrade to cached external reference
        const modified = [ops.external, key, cache];
        annotate(modified, code.location);
        return modified;
      } else if (fn === undetermined) {
        // Transform undetermined reference to regular scope call
        const modified = [ops.scope, key];
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
      return transformScopeReferences(
        child,
        cache,
        enableCaching,
        updatedLocals
      );
    } else {
      return child;
    }
  });

  if (code.location) {
    annotate(modified, code.location);
  }
  return modified;
}

export function program(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "program",
  });
}

export function templateDocument(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "templateDocument",
  });
}
