import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Reverse the order of keys at all levels of the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {AsyncTree}
 */
export default function deepReverse(treelike) {
  assertIsTreelike(treelike, "deepReverse");

  const tree = from(treelike, { deep: true });
  return {
    async get(key) {
      let value = await tree.get(key);
      if (isAsyncTree(value)) {
        value = deepReverse(value);
      }
      return value;
    },

    async keys() {
      const keys = Array.from(await tree.keys());
      keys.reverse();
      return keys;
    },
  };
}
