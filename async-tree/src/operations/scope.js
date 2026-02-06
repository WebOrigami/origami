import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import getParent from "../utilities/getParent.js";

/**
 * A map's "scope" is the collection of everything in that map and all of its
 * ancestors.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function scope(maplike) {
  const source = await args.map(maplike, "Tree.scope");

  return Object.assign(new AsyncMap(), {
    description: "scope",

    // Starting with this map, search up the parent hierarchy.
    async get(key) {
      /** @type {Map|AsyncMap|null} */
      let current = source;
      let value;
      while (current) {
        value = await current.get(key);
        if (value !== undefined) {
          break;
        }
        current = getParent(current);
      }
      return value;
    },

    // Collect all keys for this tree and all parents
    async *keys() {
      const scopeKeys = new Set();
      /** @type {Map|AsyncMap|null} */
      let current = source;
      while (current) {
        for await (const key of current.keys()) {
          scopeKeys.add(key);
        }
        current = getParent(current);
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
      let current = source;
      while (current) {
        result.push(current);
        current = "parent" in current ? current.parent : null;
      }

      return result;
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
