import * as Tree from "../Tree.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @returns {AsyncTree & { description: string }}
 */
export default function mergeDeep(...trees) {
  return {
    description: "mergeDeep",

    async get(key) {
      const subtrees = [];

      for (const tree of trees) {
        const value = await tree.get(key);
        if (Tree.isAsyncTree(value)) {
          subtrees.push(value);
        } else if (value !== undefined) {
          return value;
        }
      }

      return subtrees.length > 0 ? mergeDeep(...subtrees) : undefined;
    },

    async isKeyForSubtree(key) {
      for (const tree of trees) {
        if (await tree.isKeyForSubtree(key)) {
          return true;
        }
      }
      return false;
    },

    async keys() {
      const keys = new Set();
      for (const tree of trees) {
        for (const key of await tree.keys()) {
          keys.add(key);
        }
      }
      return keys;
    },
  };
}
