import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";
import isTreelike from "./isTreelike.js";
import keys from "./keys.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike[]} sources
 * @returns {AsyncTree & { description: string }}
 */
export default function deepMerge(...sources) {
  const filtered = sources.filter((source) => source);
  let trees = filtered.map((treelike) => from(treelike, { deep: true }));

  return Object.assign(new AsyncMap(), {
    description: "deepMerge",

    async get(key) {
      const subtrees = [];

      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        const tree = trees[index];
        const value = await tree.get(key);
        if (
          isAsyncTree(value) ||
          (isTreelike(value) && trailingSlash.has(key))
        ) {
          subtrees.unshift(value);
        } else if (value !== undefined) {
          return value;
        }
      }

      if (subtrees.length > 1) {
        const merged = deepMerge(...subtrees);
        return merged;
      } else if (subtrees.length === 1) {
        return subtrees[0];
      } else {
        return undefined;
      }
    },

    async keys() {
      const treeKeys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of trees) {
        for (const key of await keys(tree)) {
          // Remove the alternate form of the key (if it exists)
          const alternateKey = trailingSlash.toggle(key);
          if (alternateKey !== key) {
            treeKeys.delete(alternateKey);
          }

          treeKeys.add(key);
        }
      }
      return treeKeys;
    },

    sources: trees,
  });
}
