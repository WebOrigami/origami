import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import isUnpackable from "../utilities/isUnpackable.js";
import from from "./from.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";
import keys from "./keys.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike[]} maplikes
 * @returns {Promise<AsyncMap>}
 */
export default async function deepMerge(...maplikes) {
  const filtered = maplikes.filter((source) => source);
  const unpacked = await Promise.all(
    filtered.map(async (source) =>
      isUnpackable(source) ? await source.unpack() : source,
    ),
  );

  // If any argument isn't maplike, throw an error.
  if (unpacked.some((source) => !isMaplike(source))) {
    throw new TypeError("Tree.deepMerge: all arguments must be maplike.");
  }

  const sources = unpacked.map((maplike) => from(maplike, { deep: true }));

  return Object.assign(new AsyncMap(), {
    description: "deepMerge",

    async get(key) {
      const subtrees = [];

      // Check trees for the indicated key in reverse order.
      for (let index = sources.length - 1; index >= 0; index--) {
        const source = sources[index];
        const normalized = /** @type {any} */ (source).trailingSlashKeys
          ? key
          : trailingSlash.remove(key);
        const value = await source.get(normalized);
        if (isMap(value) || (isMaplike(value) && trailingSlash.has(key))) {
          subtrees.unshift(value);
        } else if (value !== undefined) {
          return value;
        }
      }

      if (subtrees.length > 1) {
        const merged = deepMerge(...subtrees);
        return merged;
      } else if (subtrees.length === 1) {
        return subtrees[0];
      } else {
        return undefined;
      }
    },

    async *keys() {
      const treeKeys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of sources) {
        for (const key of await keys(tree)) {
          // Remove the alternate form of the key (if it exists)
          const alternateKey = trailingSlash.toggle(key);
          if (alternateKey !== key) {
            treeKeys.delete(alternateKey);
          }

          treeKeys.add(key);
        }
      }
      yield* treeKeys;
    },

    sources,

    trailingSlashKeys: true,
  });
}
