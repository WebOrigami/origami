import { ObjectTree, Tree } from "@graphorigami/async-tree";
import setDeep from "../builtins/@tree/setDeep.js";

/**
 * Caches the results retrieved from one source tree in a second cache tree.
 * The second cache tree is consulted first.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class CacheSite {
  /**
   * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
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
  }

  async get(key) {
    return this.traverse(key);
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

  async traverse(...keys) {
    if (keys.length === 0 || keys[0] === undefined) {
      return this;
    }

    let cacheValue = await Tree.traverse(this.cache, ...keys);
    if (cacheValue !== undefined && !Tree.isAsyncTree(cacheValue)) {
      // Non-tree cache hit
      return cacheValue;
    }

    // Cache miss
    let value = await Tree.traverse(this.tree, ...keys);
    if (value !== undefined) {
      // Does this key match the filter?
      let match;
      let filterValue;
      if (this.filter === undefined) {
        match = true;
      } else {
        filterValue = await Tree.traverse(this.filter, ...keys);
        match = filterValue !== undefined;
      }
      if (match) {
        // Save in cache before returning.

        // Convert keys and value to an object that can be applied.
        const updates = {};
        let current = updates;
        const lastKey = keys.pop();
        for (const key of keys) {
          current[key] = {};
          current = current[key];
        }
        // If we have a tree value, we don't cache the entire thing, just an
        // empty tree.
        current[lastKey] = Tree.isAsyncTree(value) ? {} : value;

        // TODO: setDeep() should return the value it set.
        await setDeep(this.cache, updates);
        cacheValue = await Tree.traverse(this.cache, ...keys, lastKey);
      }

      if (Tree.isAsyncTree(value)) {
        // Construct merged tree for a tree result.
        value = Reflect.construct(this.constructor, [
          value,
          cacheValue,
          filterValue,
        ]);
      }

      return value;
    }

    return undefined;
  }
}
