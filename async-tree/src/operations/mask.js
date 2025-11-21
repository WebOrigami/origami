import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";
import keys from "./keys.js";

/**
 * Given trees `a` and `b`, return a masked version of `a` where only the keys
 * that exist in `b` and have truthy values are kept. The filter operation is
 * deep: if a value from `a` is a subtree, it will be filtered recursively.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} aMaplike
 * @param {Maplike} bMaplike
 * @returns {Promise<AsyncMap>}
 */
export default async function mask(aMaplike, bMaplike) {
  const aMap = await getMapArgument(aMaplike, "filter", { position: 0 });
  const bMap = await getMapArgument(bMaplike, "filter", {
    deep: true,
    position: 1,
  });

  return Object.assign(new AsyncMap(), {
    description: "mask",

    async get(key) {
      // The key must exist in b and return a truthy value
      const bValue = await bMap.get(key);
      if (!bValue) {
        return undefined;
      }
      const normalized = /** @type {any} */ (aMap).trailingSlashKeys
        ? key
        : trailingSlash.remove(key);
      let aValue = await aMap.get(normalized);
      if (isMaplike(aValue)) {
        // Filter the subtree
        return mask(aValue, bValue);
      } else {
        return aValue;
      }
    },

    async *keys() {
      // Use a's keys as the basis
      const aKeys = await keys(aMap);
      const bValues = await Promise.all(aKeys.map((key) => bMap.get(key)));
      // An async tree value in b implies that the a key should have a slash
      const aKeySlashes = aKeys.map((key, index) =>
        trailingSlash.toggle(
          key,
          trailingSlash.has(key) || isMap(bValues[index])
        )
      );
      // Remove keys that don't have values in b
      const treeKeys = aKeySlashes.filter(
        (key, index) => bValues[index] ?? false
      );
      yield* treeKeys;
    },

    source: aMap,

    trailingSlashKeys: true,
  });
}
