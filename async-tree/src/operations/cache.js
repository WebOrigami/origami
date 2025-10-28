import SyncMap from "../drivers/SyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import isReadOnlyMap from "./isReadOnlyMap.js";
import keys from "./keys.js";

/**
 * Caches values from a source tree in a second cache tree. Cache source tree
 * keys in memory.
 *
 * If no second tree is supplied, an in-memory value cache is used.
 *
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} sourceTreelike
 * @param {Treelike} [cacheTreelike]
 * @returns {Promise<SyncMap|AsyncMap>}
 */
export default async function treeCache(sourceTreelike, cacheTreelike) {
  const source = await getTreeArgument(sourceTreelike, "cache", {
    position: 0,
  });

  let cache;
  if (cacheTreelike) {
    cache = /** @type {any} */ (
      await getTreeArgument(cacheTreelike, "cache", { position: 1 })
    );
    // @ts-ignore
    if (isReadOnlyMap(cache)) {
      throw new Error("cache: Cache tree can't be read-only.");
    }
  } else {
    cache = new SyncMap();
  }

  let sourceKeys;

  return /** @type {any} */ ({
    description: "cache",

    async get(key) {
      // Check cache tree first.
      let cacheValue = await cache.get(key);
      if (cacheValue !== undefined && !isAsyncTree(cacheValue)) {
        // Leaf node cache hit
        return cacheValue;
      }

      // Cache miss or interior node cache hit.
      let value = await source.get(key);
      if (isAsyncTree(value)) {
        // Construct merged tree for a tree result.
        if (cacheValue === undefined) {
          // Construct new empty container in cache
          await cache.set(key, cache.constructor.EMPTY);
          cacheValue = await cache.get(key);
        }
        value = treeCache(value, cacheValue);
      } else if (value !== undefined) {
        // Save in cache before returning.
        await cache.set(key, value);
      }

      return value;
    },

    async keys() {
      sourceKeys ??= await keys(source);
      return sourceKeys;
    },
  });
}
