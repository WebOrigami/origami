import { Tree } from "../internal.js";

/**
 * Reverse the order of the top-level keys in the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {AsyncTree}
 */
export default function reverse(treelike) {
  const tree = Tree.from(treelike);
  return {
    async get(key) {
      return tree.get(key);
    },

    async keys() {
      const keys = Array.from(await tree.keys());
      keys.reverse();
      return keys;
    },
  };
}
