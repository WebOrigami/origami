import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import keys from "./keys.js";

/**
 * Return a new map with the keys reversed.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function reverse(maplike) {
  const source = await getMapArgument(maplike, "Tree.reverse");
  return Object.assign(new AsyncMap(), {
    description: "reverse",

    async get(key) {
      return source.get(key);
    },

    async *keys() {
      const treeKeys = await keys(source);
      treeKeys.reverse();
      yield* treeKeys;
    },

    source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
