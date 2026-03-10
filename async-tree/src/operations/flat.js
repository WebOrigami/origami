import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import deepEntriesIterator from "./deepEntriesIterator.js";

/**
 * Flatten the entries in the tree to the given depth. If the depth is omitted,
 * the tree will be flattened one level.
 *
 * Numeric keys will be renumbered.
 *
 * If the final result is array-like, returns an array, otherwise returns a map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {number} [depth] The maximum depth to flatten
 */
export default async function flat(maplike, depth = 1) {
  const map = await args.map(maplike, "Tree.flat", { deep: true });

  let index = 0;
  let onlyNumericKeys = true;
  const result = new SyncMap();
  for await (let [key, value] of deepEntriesIterator(map, { depth })) {
    if (!isNaN(parseInt(key))) {
      // Numeric key, renumber it.
      key = String(index);
      index++;
    } else {
      // Non-numeric key, keep it as is.
      onlyNumericKeys = false;
    }
    result.set(key, value);
  }

  if (onlyNumericKeys) {
    // All keys are numeric, return an array.
    return [...result.values()];
  } else {
    // Some keys are non-numeric, return a map.
    return result;
  }
}
