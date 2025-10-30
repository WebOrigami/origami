import SyncMap from "../drivers/SyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import entries from "./entries.js";
import isMap from "./isMap.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function sync(maplike) {
  const tree = await getTreeArgument(maplike, "addNextPrevious");
  const treeEntries = await entries(tree);
  const resolved = await Promise.all(
    treeEntries.map(async ([key, value]) => {
      const resolvedValue = isMap(value) ? await sync(value) : value;
      return [key, resolvedValue];
    })
  );
  return new SyncMap(resolved);
}
