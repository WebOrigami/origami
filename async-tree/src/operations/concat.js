import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import isUnpackable from "../utilities/isUnpackable.js";
import entries from "./entries.js";

/**
 * Concatenate the given trees. This is similar to a merge, but numeric keys
 * will be renumbered starting with 0 and incrementing by 1.
 *
 * If the final result is array-like, returns an array, otherwise returns a map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {(Maplike|null)[]} trees
 */
export default async function concat(...trees) {
  // Filter out null or undefined trees.
  /** @type {Maplike[]}
   * @ts-ignore */
  const filtered = trees.filter((tree) => tree);

  // Unpack any packed objects.
  const sources = await Promise.all(
    filtered.map((obj) =>
      isUnpackable(obj) ? /** @type {any} */ (obj).unpack() : obj,
    ),
  );

  if (sources.length === 0) {
    throw new TypeError("Tree.concat: all arguments are null or undefined");
  }

  let index = 0;
  let onlyNumericKeys = true;
  const map = new SyncMap();
  for (const source of sources) {
    const sourceEntries = await entries(source);
    for (let [key, value] of sourceEntries) {
      key = trailingSlash.remove(key);
      if (typeof key === "number" || /^\d+$/.test(key)) {
        // Numeric key, renumber it.
        key = String(index);
        index++;
      } else {
        // Non-numeric key, keep it as is.
        onlyNumericKeys = false;
      }
      map.set(key, value);
    }
  }

  if (onlyNumericKeys) {
    // All keys are numeric, return an array.
    return [...map.values()];
  } else {
    // Some keys are non-numeric, return a map.
    return map;
  }
}
