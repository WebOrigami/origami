import getTreeArgument from "../utilities/getTreeArgument.js";

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
