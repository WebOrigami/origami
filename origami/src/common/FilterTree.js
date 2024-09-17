import { Tree } from "@weborigami/async-tree";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class FilterTree {
  constructor(tree, filter) {
    this.tree = Tree.from(tree);
    this.filter = Tree.from(filter, { deep: true });
    this.parent = null;
  }

  async get(key) {
    let value = await this.tree.get(key);

    let filterValue = await this.filter.get(key);
    if (!Tree.isAsyncTree(value)) {
      if (filterValue === undefined) {
        value = undefined;
      } else if (Tree.isAsyncTree(filterValue)) {
        value = undefined;
      }
    } else if (Tree.isAsyncTree(filterValue)) {
      // Wrap value with corresponding filter.
      value = Reflect.construct(this.constructor, [value, filterValue]);
    }

    return value;
  }

  async keys() {
    const keys = new Set();

    // Enumerate all keys in the tree that can be found in the filter tree.
    for (const key of await this.tree.keys()) {
      const filterValue = await this.filter.get(key);
      const isFilterValueTree = Tree.isAsyncTree(filterValue);
      // If the filter value is a tree, the corresponding value in the tree
      // must be a tree too.
      const match =
        (!isFilterValueTree && filterValue) ||
        (isFilterValueTree && (await Tree.isKeyForSubtree(this.tree, key)));
      if (match) {
        keys.add(key);
      }
    }

    // Also include any keys in the filter that are found in the tree. This
    // lets the filter "pull" values from a tree that, e.g., is defined by a
    // function without an explicit domain.
    // for (const key of await this.filter.keys()) {
    //   const value = await this.tree.get(key);
    //   if (value !== undefined) {
    //     keys.add(key);
    //   }
    // }

    return keys;
  }
}
