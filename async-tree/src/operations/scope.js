import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * A tree's "scope" is the collection of everything in that tree and all of its
 * ancestors.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function scope(maplike) {
  const tree = await getTreeArgument(maplike, "scope");

  return Object.assign(new AsyncMap(), {
    description: "scope",

    // Starting with this tree, search up the parent hierarchy.
    async get(key) {
      /** @type {Map|AsyncMap|null} */
      let current = tree;
      let value;
      while (current) {
        value = await current.get(key);
        if (value !== undefined) {
          break;
        }
        current = "parent" in current ? current.parent : null;
      }
      return value;
    },

    // Collect all keys for this tree and all parents
    async *keys() {
      const scopeKeys = new Set();
      /** @type {Map|AsyncMap|null} */
      let current = tree;
      while (current) {
        for await (const key of current.keys()) {
          scopeKeys.add(key);
        }
        current = "parent" in current ? current.parent : null;
      }

      yield* scopeKeys;
    },

    // Collect all keys for this tree and all parents.
    //
    // This method exists for debugging purposes, as it's helpful to be able to
    // quickly flatten and view the entire scope chain.
    get trees() {
      const result = [];

      /** @type {Map|AsyncMap|null} */
      let current = tree;
      while (current) {
        result.push(current);
        current = "parent" in current ? current.parent : null;
      }

      return result;
    },

    source: tree,
  });
}
