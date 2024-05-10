import { Tree } from "../internal.js";

/**
 * Return a tree that performs a deep merge of the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @param {import("../../index.ts").Treelike[]} sources
 * @returns {AsyncTree & { description: string }}
 */
export default function mergeDeep(...sources) {
  let trees = sources.map((treelike) => Tree.from(treelike));
  let mergeParent;
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
        if (await Tree.isKeyForSubtree(tree, key)) {
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
