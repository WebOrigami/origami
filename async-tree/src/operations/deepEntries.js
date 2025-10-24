import getTreeArgument from "../utilities/getTreeArgument.js";
import entries from "./entries.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Return the deep nested entries in the tree as arrays of [key, value] pairs.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function deepEntries(treelike) {
  const tree = await getTreeArgument(treelike, "deepEntries");

  const treeEntries = await entries(tree);
  const result = await Promise.all(
    treeEntries.map(async ([key, value]) => {
      const resolvedValue = isAsyncTree(value)
        ? await deepEntries(value)
        : value;
      return [key, resolvedValue];
    })
  );
  return result;
}
