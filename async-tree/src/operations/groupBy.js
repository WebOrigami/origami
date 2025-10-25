import ObjectMap from "../drivers/ObjectMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import from from "./from.js";
import isTreelike from "./isTreelike.js";
import keys from "./keys.js";
import values from "./values.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default async function groupBy(treelike, groupKeyFn) {
  const tree = await getTreeArgument(treelike, "groupBy");

  const treeKeys = await keys(tree);

  // Are all the keys integers?
  const isArray = treeKeys.every((key) => !Number.isNaN(parseInt(key)));

  const result = {};
  for (const key of treeKeys) {
    const value = await tree.get(key);

    // Get the groups for this value.
    let groups = await groupKeyFn(value, key, tree);
    if (!groups) {
      continue;
    }

    if (!isTreelike(groups)) {
      // A single value was returned
      groups = [groups];
    }
    groups = from(groups);

    // Add the value to each group.
    for (const group of await values(groups)) {
      if (isArray) {
        result[group] ??= [];
        result[group].push(value);
      } else {
        result[group] ??= {};
        result[group][key] = value;
      }
    }
  }

  return new ObjectMap(result);
}
