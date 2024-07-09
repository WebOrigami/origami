import { Tree } from "../internal.js";

/**
 * Return a tree that performs a shallow merge of the given trees.
 *
 * Given a set of trees, the `get` method looks at each tree in turn. The first
 * tree is asked for the value with the key. If an tree returns a defined value
 * (i.e., not undefined), that value is returned. If the first tree returns
 * undefined, the second tree will be asked, and so on. If none of the trees
 * return a defined value, the `get` method returns undefined.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @param {import("../../index.ts").Treelike[]} sources
 * @returns {AsyncTree & { description: string, trees: AsyncTree[]}}
 */
export default function merge(...sources) {
  return {
    description: "merge",

    async get(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = this.trees.length - 1; index >= 0; index--) {
        const tree = this.trees[index];
        const value = await tree.get(key);
        if (value !== undefined) {
          if (Tree.isAsyncTree(value) && value.parent === tree) {
            // Merged tree acts as parent instead of the source tree.
            value.parent = this;
          }
          return value;
        }
      }
      return undefined;
    },

    async isKeyForSubtree(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = this.trees.length - 1; index >= 0; index--) {
        if (await Tree.isKeyForSubtree(this.trees[index], key)) {
          return true;
        }
      }
      return false;
    },

    async keys() {
      const keys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of this.trees) {
        for (const key of await tree.keys()) {
          keys.add(key);
        }
      }
      return keys;
    },

    trees: sources.map((treelike) => Tree.from(treelike)),
  };
}
