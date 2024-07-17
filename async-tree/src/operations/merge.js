import { Tree } from "../internal.js";
import * as symbols from "../symbols.js";

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
  const trees = sources.map((treelike) => Tree.from(treelike));
  return {
    description: "merge",

    async get(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        const tree = trees[index];
        const value = await tree.get(key);
        if (value !== undefined) {
          // Merged tree acts as parent instead of the source tree.
          if (Tree.isAsyncTree(value) && value.parent === tree) {
            value.parent = this;
          } else if (
            typeof value === "object" &&
            value?.[symbols.parent] === tree
          ) {
            value[symbols.parent] = this;
          }
          return value;
        }
      }
      return undefined;
    },

    async isKeyForSubtree(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        if (await Tree.isKeyForSubtree(trees[index], key)) {
          return true;
        }
      }
      return false;
    },

    async keys() {
      const keys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of trees) {
        for (const key of await tree.keys()) {
          keys.add(key);
        }
      }
      return keys;
    },

    get trees() {
      return trees;
    },
  };
}
