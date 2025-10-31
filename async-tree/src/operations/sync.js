import SyncMap from "../drivers/SyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import mapReduce from "./mapReduce.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function sync(maplike) {
  const tree = await getTreeArgument(maplike, "addNextPrevious");
  return mapReduce(tree, null, (values, keys) => {
    const entries = [];
    for (let i = 0; i < keys.length; i++) {
      entries.push([keys[i], values[i]]);
    }
    return new SyncMap(entries);
  });
}
