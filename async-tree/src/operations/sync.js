import SyncMap from "../drivers/SyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import entries from "./entries.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function sync(treelike) {
  const tree = await getTreeArgument(treelike, "addNextPrevious");
  const treeEntries = await entries(tree);
  const resolved = await Promise.all(
    treeEntries.map(async ([key, value]) => {
      const resolvedValue = isAsyncTree(value) ? await sync(value) : value;
      return [key, resolvedValue];
    })
  );
  return new SyncMap(resolved);
}
