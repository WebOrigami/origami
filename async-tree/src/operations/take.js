import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default async function take(treelike, count) {
  const tree = await getTreeArgument(treelike, "take");

  return Object.assign(new AsyncMap(), {
    description: `take ${count}`,

    async *keys() {
      const treeKeys = await keys(tree);
      yield* treeKeys.slice(0, count);
    },

    async get(key) {
      return tree.get(key);
    },

    source: tree,
  });
}
