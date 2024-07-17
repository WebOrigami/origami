import { Tree } from "../internal.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @param {import("../../index.ts").Treelike[]} sources
 * @returns {AsyncTree & { description: string }}
 */
export default function deepMerge(...sources) {
  let trees = sources.map((treelike) => Tree.from(treelike, { deep: true }));
  let mergeParent;
  return {
    description: "deepMerge",

    async get(key) {
      const subtrees = [];

      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        const tree = trees[index];
        const value = await tree.get(key);
        if (Tree.isAsyncTree(value)) {
          if (value.parent === tree) {
            // Merged tree acts as parent instead of the source tree.
            value.parent = this;
          }
          subtrees.unshift(value);
        } else if (value !== undefined) {
          return value;
        }
      }

      if (subtrees.length > 1) {
        const merged = deepMerge(...subtrees);
        merged.parent = this;
        return merged;
      } else if (subtrees.length === 1) {
        return subtrees[0];
      } else {
        return undefined;
      }
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
