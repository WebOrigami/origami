import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";
import keys from "./keys.js";

/**
 * Reverse the order of keys at all levels of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function deepReverse(maplike) {
  const source = await getMapArgument(maplike, "Tree.deepReverse", {
    deep: true,
  });

  return Object.assign(new AsyncMap(), {
    description: "deepReverse",

    async get(key) {
      let value = await source.get(key);
      if (isMap(value)) {
        value = deepReverse(value);
      }
      return value;
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
