import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import deepEntriesIterator from "./deepEntriesIterator.js";

/**
 * Flatten the entries in the tree to the given depth. If the depth is omitted,
 * the entire tree will be flattened. A depth of 1 will flatten a single level
 * of the tree, leaving nested trees intact.
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

  // We add 1 to the depth because deepEntriesIterator counts the top level as
  // depth 1, but we want to count it as depth 0 for flattening purposes.
  const flattenDepth = depth ? depth + 1 : Infinity;

  let index = 0;
  let onlyNumericKeys = true;
  const result = new SyncMap();
  for await (let [key, value] of deepEntriesIterator(map, {
    depth: flattenDepth,
  })) {
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
