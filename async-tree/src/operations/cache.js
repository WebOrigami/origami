import AsyncMap from "../drivers/AsyncMap.js";
import SyncMap from "../drivers/SyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import child from "./child.js";
import isMap from "./isMap.js";
import isReadOnlyMap from "./isReadOnlyMap.js";
import keys from "./keys.js";

/**
 * Caches values from a source tree in a second cache tree. Cache source tree
 * keys in memory.
 *
 * If no second tree is supplied, an in-memory value cache is used.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} sourceMaplike
 * @param {Maplike} [cacheMaplike]
 * @returns {Promise<SyncMap|AsyncMap>}
 */
export default async function treeCache(sourceMaplike, cacheMaplike) {
  const source = await getMapArgument(sourceMaplike, "cache", {
    position: 0,
  });

  let cache;
  if (cacheMaplike) {
    cache = /** @type {any} */ (
      await getMapArgument(cacheMaplike, "cache", { position: 1 })
    );
    // @ts-ignore
    if (isReadOnlyMap(cache)) {
      throw new Error("cache: Cache tree can't be read-only.");
    }
  } else {
    cache = new SyncMap();
  }

  let sourceKeys;

  return Object.assign(new AsyncMap(), {
    description: "cache",

    async get(key) {
      // Check cache tree first.
      let cacheValue = await cache.get(key);
      if (cacheValue !== undefined && !isMap(cacheValue)) {
        // Leaf node cache hit
        return cacheValue;
      }

      // Cache miss or interior node cache hit.
      let value = await source.get(key);
      if (isMap(value)) {
        // Construct merged tree for a tree result.
        if (cacheValue === undefined) {
          // Construct new empty container in cache
          cacheValue = await child(cache, key);
        }
        value = treeCache(value, cacheValue);
      } else if (value !== undefined) {
        // Save in cache before returning.
        await cache.set(key, value);
      }

      return value;
    },

    async *keys() {
      sourceKeys ??= await keys(source);
      yield* sourceKeys;
    },

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
