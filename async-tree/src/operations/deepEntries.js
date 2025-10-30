import getTreeArgument from "../utilities/getTreeArgument.js";
import entries from "./entries.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Return the deep nested entries in the tree as arrays of [key, value] pairs.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function deepEntries(maplike) {
  const tree = await getTreeArgument(maplike, "deepEntries");

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
