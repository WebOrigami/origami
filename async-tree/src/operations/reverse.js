import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Reverse the order of the top-level keys in the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function reverse(maplike) {
  const tree = await getTreeArgument(maplike, "reverse");

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
