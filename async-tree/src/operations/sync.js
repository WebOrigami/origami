import SyncMap from "../drivers/SyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import mapReduce from "./mapReduce.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function sync(source) {
  const tree = await getMapArgument(source, "sync");
  return mapReduce(tree, null, (values, keys) => {
    const entries = [];
    for (let i = 0; i < keys.length; i++) {
      entries.push([keys[i], values[i]]);
    }
    return new SyncMap(entries);
  });
}
