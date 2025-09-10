import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Return a tree whose keys are provided by the _values_ of a second tree (e.g.,
 * an array of keys).
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike} treelike
 * @param {Treelike} keysTreelike
 * @returns {AsyncTree}
 */
export default function withKeys(treelike, keysTreelike) {
  assertIsTreelike(treelike, "withKeys");
  const tree = Tree.from(treelike);
  assertIsTreelike(keysTreelike, "withKeys", 1);
  const keysTree = Tree.from(keysTreelike);

  let keys;

  return {
    async get(key) {
      return tree.get(key);
    },

    async keys() {
      keys ??= await Tree.values(keysTree);
      return keys;
    },
  };
}
