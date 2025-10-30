import AsyncMap from "../drivers/AsyncMap.js";
import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * A tree whose keys are strings interpreted as regular expressions.
 *
 * Requests to `get` a key are matched against the regular expressions, and the
 * value for the first matching key is returned. The regular expresions are
 * taken to match the entire key -- if they do not already start and end with
 * `^` and `$` respectively, those are added.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function regExpKeys(maplike) {
  const tree = await getTreeArgument(maplike, "regExpKeys", { deep: true });

  const map = new SyncMap();

  // We build the output tree first so that we can refer to it when setting
  // `parent` on subtrees below.
  let result = Object.assign(new AsyncMap(), {
    // @ts-ignore
    description: "regExpKeys",

    async get(key) {
      if (key == null) {
        // Reject nullish key.
        throw new ReferenceError(
          `regExpKeys: Cannot get a null or undefined key.`
        );
      }

      for (const [regExp, value] of map) {
        if (regExp.test(key)) {
          return value;
        }
      }
      return undefined;
    },

    async *keys() {
      return map.keys();
    },

    source: tree,
  });

  // Turn the input tree's string keys into regular expressions, then map those
  // to the corresponding values.
  for await (const key of tree.keys()) {
    if (typeof key !== "string") {
      // Skip non-string keys.
      continue;
    }

    // Get value.
    let value = await tree.get(key);

    let regExp;
    if (trailingSlash.has(key) || isAsyncTree(value)) {
      const baseKey = trailingSlash.remove(key);
      regExp = new RegExp("^" + baseKey + "/?$");
      // Subtree
      value = regExpKeys(value);
      if (!value.parent) {
        value.parent = result;
      }
    } else {
      // Construct regular expression.
      regExp = new RegExp(key);
    }
    map.set(regExp, value);
  }

  return result;
}
