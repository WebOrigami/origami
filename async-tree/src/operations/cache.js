import { ObjectTree, Tree } from "@weborigami/async-tree";

/**
 * Caches values from a source tree in a second cache tree. If no second tree is
 * supplied, an in-memory cache is used.
 *
 * An optional third filter tree can be supplied. If a filter tree is supplied,
 * only values for keys that match the filter will be cached.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 *
 * @param {AsyncTree} source
 * @param {AsyncMutableTree} [cacheTree]
 * @param {AsyncTree} [filter]
 * @returns {AsyncTree & { description: string }}
 */
export default function treeCache(source, cacheTree, filter) {
  /** @type {AsyncMutableTree} */
  const cache = cacheTree ?? new ObjectTree({});
  return {
    description: "cache",

    async get(key) {
      // Check cache tree first.
      let cacheValue = await cache.get(key);
      if (cacheValue !== undefined && !Tree.isAsyncTree(cacheValue)) {
        // Leaf node cache hit
        return cacheValue;
      }

      // Cache miss or interior node cache hit.
      let value = await source.get(key);
      if (value !== undefined) {
        // If a filter is defined, does the key match the filter?
        const filterValue = await filter?.get(key);
        const filterMatch = !filter || filterValue !== undefined;
        if (filterMatch) {
          if (Tree.isAsyncTree(value)) {
            // Construct merged tree for a tree result.
            if (cacheValue === undefined) {
              // Construct new container in cache
              await cache.set(key, {});
              cacheValue = await cache.get(key);
            }
            value = treeCache(value, cacheValue, filterValue);
          } else {
            // Save in cache before returning.
            await cache.set(key, value);
          }
        }

        return value;
      }

      return undefined;
    },

    async isKeyForSubtree(key) {
      return Tree.isKeyForSubtree(source, key);
    },

    async keys() {
      const keys = new Set(await source.keys());

      // We also add the cache's keys in case the keys provided by the source
      // tree have changed since the cache was updated.
      for (const key of await cache.keys()) {
        keys.add(key);
      }

      return keys;
    },
  };
}
