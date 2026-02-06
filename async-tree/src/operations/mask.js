import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getMapArgument from "../utilities/getMapArgument.js";
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
  const aMap = await getMapArgument(aMaplike, "Tree.mask", {
    deep: true,
    position: 1,
  });
  const bMap = await getMapArgument(bMaplike, "Tree.mask", {
    deep: true,
    position: 2,
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
      // Get keys from a and b
      const [aKeys, bKeys] = await Promise.all([keys(aMap), keys(bMap)]);

      const combined = Array.from(new Set([...aKeys, ...bKeys]));

      // Get all the values from b. Because a and b may be defined by functions,
      // they might have values that are not represented in their own keys.
      const bValues = await Promise.all(combined.map((key) => bMap.get(key)));

      // Find keys that have truthy values in b. While we're at it, we can add
      // slashes even if a or b didn't have them.
      const withSlashes = combined.map((key, index) => {
        const bValue = bValues[index];
        if (!bValue) {
          // Mark for removal
          return undefined;
        }
        return trailingSlash.toggle(
          key,
          trailingSlash.has(key) || isMaplike(bValue),
        );
      });

      // Yield only the keys that have truthy values in b
      const filtered = withSlashes.filter((value) => value !== undefined);
      yield* new Set(filtered);
    },

    source: aMap,

    trailingSlashKeys: true,
  });
}
