import AsyncMap from "../drivers/AsyncMap.js";
import isMap from "./isMap.js";

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
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @param {string|RegExp} pattern
 * @param {Invocable} resultFn
 * @param {Maplike} [keys]
 */
export default function match(pattern, resultFn, keys = []) {
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

  const result = Object.assign(new AsyncMap(), {
    description: "match",

    async get(key) {
      const keyMatch = regex.exec(key);
      if (!keyMatch) {
        return undefined;
      }

      if (
        typeof resultFn !== "function" &&
        !(isMap(resultFn) && "parent" in resultFn)
      ) {
        // Simple return value; return as is
        return resultFn;
      }

      // Copy the `groups` property to a real object
      const matches = { ...keyMatch.groups };

      // Invoke the result function with the extended scope.
      let value;
      if (typeof resultFn === "function") {
        value = await resultFn(matches);
      } else {
        value = Object.create(resultFn);
      }

      return value;
    },

    async *keys() {
      yield* typeof keys === "function" ? await keys() : keys;
    },
  });

  return result;
}
