import { Tree } from "@graphorigami/async-tree";

/**
 * This is a variation of MergeTree that performs a deep merge.
 *
 * Given a set of trees, the get method will look at each tree in turn. The
 * first tree is asked for object with the key. If an tree returns a defined
 * value (i.e., not undefined), that value is returned. If the first tree
 * returns undefined, the second tree will be asked, and so on.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class MergeDeepTree {
  constructor(...trees) {
    this.trees = trees.map((tree) => Tree.from(tree));
  }

  async get(key) {
    const subtrees = [];

    for (const tree of this.trees) {
      const value = await tree.get(key);
      if (Tree.isAsyncTree(value)) {
        subtrees.push(value);
      } else if (value !== undefined) {
        return value;
      }
    }

    return subtrees.length > 0 ? new MergeDeepTree(...subtrees) : undefined;
  }

  async keys() {
    const keys = new Set();
    for (const tree of this.trees) {
      for (const key of await tree.keys()) {
        keys.add(key);
      }
    }
    return keys;
  }
}
