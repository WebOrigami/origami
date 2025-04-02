import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

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
  assertIsTreelike(treelike, "reverse");
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
