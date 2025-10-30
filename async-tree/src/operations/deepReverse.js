import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import keys from "./keys.js";

/**
 * Reverse the order of keys at all levels of the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<AsyncTree>}
 */
export default async function deepReverse(treelike) {
  const tree = await getTreeArgument(treelike, "deepReverse", { deep: true });

  return Object.assign(new AsyncMap(), {
    description: "deepReverse",

    async get(key) {
      let value = await tree.get(key);
      if (isAsyncTree(value)) {
        value = deepReverse(value);
      }
      return value;
    },

    async *keys() {
      const treeKeys = Array.from(await keys(tree));
      treeKeys.reverse();
      yield* treeKeys;
    },

    source: tree,
  });
}
