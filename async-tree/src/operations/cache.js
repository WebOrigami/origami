import ObjectTree from "../drivers/ObjectTree.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import from from "./from.js";
import isAsyncMutableTree from "./isAsyncMutableTree.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Caches values from a source tree in a second cache tree. Cache source tree
 * keys in memory.
 *
 * If no second tree is supplied, an in-memory value cache is used.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} sourceTreelike
 * @param {AsyncMutableTree} [cacheTreelike]
 * @returns {Promise<AsyncTree>}
 */
export default async function treeCache(sourceTreelike, cacheTreelike) {
  const source = await getTreeArgument(sourceTreelike, "cache", {
    position: 0,
  });

  /** @type {AsyncMutableTree} */
  let cache;
  if (cacheTreelike) {
    cache = /** @type {any} */ (
      await getTreeArgument(cacheTreelike, "cache", { position: 1 })
    );
    // @ts-ignore
    if (!isAsyncMutableTree(cache)) {
      throw new Error("Cache tree must define a set() method.");
    }
  } else {
    cache = new ObjectTree({});
  }

  let keys;

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
          await cache.set(key, {});
          cacheValue = await cache.get(key);
          if (!isAsyncTree(cacheValue)) {
            // Coerce to tree and then save it back to the cache. This is
            // necessary, e.g., if cache is an ObjectTree; we want the
            // subtree to also be an ObjectTree, not a plain object.
            cacheValue = from(cacheValue);
            await cache.set(key, cacheValue);
          }
        }
        value = treeCache(value, cacheValue);
      } else if (value !== undefined) {
        // Save in cache before returning.
        await cache.set(key, value);
      }

      return value;
    },

    async keys() {
      keys ??= await source.keys();
      return keys;
    },
  });
}
