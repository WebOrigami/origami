import { Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
 * invokes the given function with an object containing the matched values.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string|RegExp} pattern
 * @param {Invocable} resultFn
 * @param {Treelike} [keys]
 */
export default function match(pattern, resultFn, keys = []) {
  assertTreeIsDefined(this, "tree:match");
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

  const tree = this;

  const result = {
    async get(key) {
      const keyMatch = regex.exec(key);
      if (!keyMatch) {
        return undefined;
      }

      if (
        typeof resultFn !== "function" &&
        !(Tree.isAsyncTree(resultFn) && "parent" in resultFn)
      ) {
        // Simple return value; return as is
        return resultFn;
      }

      // Copy the `groups` property to a real object
      const matches = { ...keyMatch.groups };

      // Invoke the result function with the extended scope.
      let value;
      if (typeof resultFn === "function") {
        value = await resultFn.call(this, matches);
      } else {
        value = Object.create(resultFn);
      }

      return value;
    },

    async keys() {
      return typeof keys === "function" ? await keys.call(tree) : keys;
    },
  };

  return result;
}

helpRegistry.set(
  "tree:match",
  "(pattern, fn, [keys]) - Matches simple patterns or regular expressions"
);
