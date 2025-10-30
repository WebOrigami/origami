import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Reverse the order of the top-level keys in the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<AsyncTree>}
 */
export default async function reverse(treelike) {
  const tree = await getTreeArgument(treelike, "reverse");

  return Object.assign(new AsyncMap(), {
    description: "reverse",

    async get(key) {
      return tree.get(key);
    },

    async *keys() {
      const treeKeys = await keys(tree);
      treeKeys.reverse();
      yield* treeKeys;
    },

    source: tree,
  });
}
