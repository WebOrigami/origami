import SyncMap from "../drivers/SyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import entries from "./entries.js";
import isMaplike from "./isMaplike.js";
import values from "./values.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default async function groupBy(maplike, groupKeyFn) {
  const source = await getMapArgument(maplike, "groupBy");

  const result = new SyncMap();
  const sourceEntries = await entries(source);

  // Are all the keys integers?
  const integerKeys = sourceEntries.every(
    ([key]) => !Number.isNaN(parseInt(key))
  );

  for (const [key, value] of sourceEntries) {
    // Get the groups for this value.
    let groups = await groupKeyFn(value, key, source);
    if (!groups) {
      continue;
    }

    if (!isMaplike(groups)) {
      // A single value was returned
      groups = [groups];
    }

    // Add the value to each group.
    for (const group of await values(groups)) {
      let grouped = await result.get(group);
      if (!grouped) {
        grouped = integerKeys ? [] : new SyncMap();
        result.set(group, grouped);
      }
      if (integerKeys) {
        grouped.push(value);
      } else {
        grouped.set(key, value);
      }
    }
  }

  return result;
}
