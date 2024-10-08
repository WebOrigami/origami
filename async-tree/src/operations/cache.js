import { ObjectTree, Tree } from "../internal.js";

/**
 * Caches values from a source tree in a second cache tree. Cache source tree
 * keys in memory.
 *
 * If no second tree is supplied, an in-memory value cache is used.
 *
 * An optional third filter tree can be supplied. If a filter tree is supplied,
 * only values for keys that match the filter will be cached.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} sourceTreelike
 * @param {AsyncMutableTree} [cacheTreelike]
 * @param {Treelike} [filterTreelike]
 * @returns {AsyncTree & { description: string }}
 */
export default function treeCache(
  sourceTreelike,
  cacheTreelike,
  filterTreelike
) {
  if (!sourceTreelike) {
    const error = new TypeError(`cache: The source tree isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const source = Tree.from(sourceTreelike);
  const filter = filterTreelike ? Tree.from(filterTreelike) : undefined;

  /** @type {AsyncMutableTree} */
  let cache;
  if (cacheTreelike) {
    // @ts-ignore
    cache = Tree.from(cacheTreelike);
    if (!Tree.isAsyncMutableTree(cache)) {
      throw new Error("Cache tree must define a set() method.");
    }
  } else {
    cache = new ObjectTree({});
  }

  let keys;
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
        const filterValue = filter ? await filter.get(key) : undefined;
        const filterMatch = !filter || filterValue !== undefined;
        if (filterMatch) {
          if (Tree.isAsyncTree(value)) {
            // Construct merged tree for a tree result.
            if (cacheValue === undefined) {
              // Construct new empty container in cache
              await cache.set(key, {});
              cacheValue = await cache.get(key);
              if (!Tree.isAsyncTree(cacheValue)) {
                // Coerce to tree and then save it back to the cache. This is
                // necessary, e.g., if cache is an ObjectTree; we want the
                // subtree to also be an ObjectTree, not a plain object.
                cacheValue = Tree.from(cacheValue);
                await cache.set(key, cacheValue);
              }
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

    async keys() {
      keys ??= await source.keys();
      return keys;
    },
  };
}
