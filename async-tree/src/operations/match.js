import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";

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
      (match, p1, offset, string, groups) => `(?<${groups.variable}>.+)`,
    );
    regex = new RegExp(`^${regexText}$`);
  } else if (pattern instanceof RegExp) {
    regex = pattern;
  } else {
    throw new Error(`Tree.match: Unsupported pattern`);
  }

  const fn = args.invocable(resultFn, "Tree.match");

  const result = Object.assign(new AsyncMap(), {
    description: "match",

    async get(key) {
      const keyMatch = regex.exec(key);
      if (!keyMatch) {
        return undefined;
      }

      // Copy the `groups` property to a real object
      const matches = { ...keyMatch.groups };

      // Invoke the result function
      const value = await fn(matches);

      return value;
    },

    async *keys() {
      yield* typeof keys === "function" ? await keys() : keys;
    },

    trailingSlashKeys: false,
  });

  return result;
}
