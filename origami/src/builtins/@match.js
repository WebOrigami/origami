import { Dictionary } from "@graphorigami/core";
import Scope from "../common/Scope.js";
import { treeWithScope } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a tree with the indicated keys (if provided).
 *
 * The pattern can a string with a simplified pattern syntax that tries to match
 * against the entire key and uses brackets to identify named wildcard values.
 * E.g. `[name].html` will match `Alice.html` with wildcard values { name:
 * "Alice" }.
 *
 * The pattern can also be a JavaScript regular expression.
 *
 * If a key is requested, match against the given pattern and, if matches,
 * incorporate the matched pattern's wildcard values into the scope and invoke
 * the indicated function to produce a result.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../..").Invocable} Invocable
 *
 * @param {string|RegExp} pattern
 * @param {Invocable} resultFn
 * @param {Treelike} [keys]
 * @this {AsyncDictionary|null}
 */
export default function match(pattern, resultFn, keys = []) {
  assertScopeIsDefined(this);
  let regex;
  if (typeof pattern === "string") {
    // Convert the simple pattern format into a regular expression.
    const regexText = pattern.replace(
      /\[(?<variable>.+)\]/g,
      (match, p1, offset, string, groups) => `(?<${groups.variable}>.+)`
    );
    regex = new RegExp(`^${regexText}$`);
  } else if (pattern instanceof RegExp) {
    regex = pattern;
  } else {
    throw new Error(`match(): Unsupported pattern`);
  }

  // Remember the scope used to invoke this function so we can extend it below.
  const scope = this;

  /** @type {AsyncTree} */
  let result = {
    async get(key) {
      const keyMatch = regex.exec(key);
      if (!keyMatch) {
        return undefined;
      }

      if (
        typeof resultFn !== "function" &&
        !(Dictionary.isAsyncDictionary(resultFn) && "parent" in resultFn)
      ) {
        // Simple return value; return as is
        return resultFn;
      }

      // If the pattern contained named wildcards, extend the scope. It appears
      // that the `groups` property of a match is *not* a real plain object, so
      // we have to make one.
      const bindings = keyMatch.groups
        ? Object.fromEntries(Object.entries(keyMatch.groups))
        : null;
      const fnScope = bindings ? new Scope(bindings, scope) : scope;

      // Invoke the result function with the extended scope.
      let value;
      if (typeof resultFn === "function") {
        value = await resultFn.call(fnScope);
      } else {
        value = Object.create(resultFn);
      }

      return value;
    },

    async keys() {
      return typeof keys === "function" ? await keys.call(scope) : keys;
    },

    parent: null,
  };

  if (this) {
    result = treeWithScope(result, this);
  }
  return result;
}

match.usage = `@match <pattern>, <fn>, [<keys>]\tMatches simple patterns or regular expressions`;
match.documentation = "https://graphorigami.org/language/@match.html";
