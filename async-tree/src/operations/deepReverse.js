import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isMap from "./isMap.js";
import keys from "./keys.js";

/**
 * Reverse the order of keys at all levels of the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function deepReverse(maplike) {
  const tree = await getTreeArgument(maplike, "deepReverse", { deep: true });

  return Object.assign(new AsyncMap(), {
    description: "deepReverse",

    async get(key) {
      let value = await tree.get(key);
      if (isMap(value)) {
        value = deepReverse(value);
      }
      return value;
    },

    async *keys() {
      const treeKeys = await keys(tree);
      treeKeys.reverse();
      yield* treeKeys;
    },

    source: tree,
  });
}
