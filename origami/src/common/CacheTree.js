import { Dictionary, ObjectTree, Tree } from "@graphorigami/core";

/**
 * Caches non-tree values from the first (source) tree in a second (cache)
 * tree. If no second tree is supplied, an in-memory cache is used.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class CacheTree {
  /**
   * @typedef {import("@graphorigami/core").Treelike} Treelike
   * @param {Treelike} tree
   * @param {Treelike} [cache]
   * @param {Treelike} [filter]
   */
  constructor(tree, cache, filter) {
    this.tree = Tree.from(tree);

    if (cache === undefined) {
      this.cache = new ObjectTree({});
    } else {
      /** @type {any} */ this.cache = Tree.from(cache);
      if (typeof this.cache.set !== "function") {
        throw new TypeError(
          `The first parameter to the Cache constructor must be a tree with a "set" method.`
        );
      }
    }

    this.filter = filter ? Tree.from(filter) : undefined;
    this.parent = null;
  }

  async get(key) {
    // Check cache tree first.
    let cacheValue = await this.cache.get(key);
    if (cacheValue !== undefined && !Dictionary.isAsyncDictionary(cacheValue)) {
      // Non-tree cache hit
      return cacheValue;
    }

    // Cache miss or tree cache hit.
    let value = await this.tree.get(key);
    if (value !== undefined) {
      // Does this key match the filter?
      let match;
      let filterValue;
      if (this.filter === undefined) {
        match = true;
      } else {
        filterValue = await this.filter.get(key);
        match = filterValue !== undefined;
      }
      if (match) {
        if (Dictionary.isAsyncDictionary(value)) {
          // Construct merged tree for a tree result.
          if (cacheValue === undefined) {
            // Construct new container in cache
            // TODO: .set() should return the value it set.
            await this.cache.set(key, {});
            cacheValue = await this.cache.get(key);
          }
          value = Reflect.construct(this.constructor, [
            value,
            cacheValue,
            filterValue,
          ]);
        } else {
          // Save in cache before returning.
          await this.cache.set(key, value);
        }
      }

      return value;
    }

    return undefined;
  }

  async keys() {
    // We also check the cache in case the keys provided by the other trees
    // have changed since the cache was updated.
    const keys = new Set(await this.cache.keys());
    for (const key of await this.tree.keys()) {
      keys.add(key);
    }
    return keys;
  }
}
