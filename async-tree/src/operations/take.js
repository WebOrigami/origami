import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default async function take(treelike, count) {
  const tree = await getTreeArgument(treelike, "take");

  return {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.slice(0, count);
    },

    async get(key) {
      return tree.get(key);
    },
  };
}
