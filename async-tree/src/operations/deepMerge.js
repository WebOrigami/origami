import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";

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
        if (
          Tree.isAsyncTree(value) ||
          (Tree.isTreelike(value) && trailingSlash.has(key))
        ) {
          if (/** @type {any} */ (value).parent === tree) {
            // Merged tree acts as parent instead of the source tree.
            /** @type {any} */ (value).parent = this;
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

    async keys() {
      const keys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of trees) {
        for (const key of await tree.keys()) {
          // Remove the alternate form of the key (if it exists)
          const alternateKey = trailingSlash.toggle(key);
          if (alternateKey !== key) {
            keys.delete(alternateKey);
          }

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
