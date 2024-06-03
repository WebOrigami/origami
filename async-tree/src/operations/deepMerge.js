import { Tree } from "../internal.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @param {import("../../index.ts").Treelike[]} sources
 * @returns {AsyncTree & { description: string }}
 */
export default function deepMerge(...sources) {
  let trees = sources.map((treelike) => Tree.from(treelike));
  let mergeParent;
  return {
    description: "deepMerge",

    async get(key) {
      const subtrees = [];

      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        const value = await trees[index].get(key);
        if (Tree.isAsyncTree(value)) {
          subtrees.unshift(value);
        } else if (value !== undefined) {
          return value;
        }
      }

      return subtrees.length > 0 ? deepMerge(...subtrees) : undefined;
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

    get parent() {
      return mergeParent;
    },
    set parent(parent) {
      mergeParent = parent;
      trees = sources.map((treelike) => {
        const tree = Tree.isAsyncTree(treelike)
          ? Object.create(treelike)
          : Tree.from(treelike);
        tree.parent = parent;
        return tree;
      });
    },
  };
}
