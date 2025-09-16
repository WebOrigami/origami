import ObjectTree from "../drivers/ObjectTree.js";
import assertIsTreelike from "../utilities/assertIsTreelike.js";
import from from "./from.js";
import isTreelike from "./isTreelike.js";
import values from "./values.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default async function group(treelike, groupKeyFn) {
  assertIsTreelike(treelike, "group");
  const tree = from(treelike);

  const keys = Array.from(await tree.keys());

  // Are all the keys integers?
  const isArray = keys.every((key) => !Number.isNaN(parseInt(key)));

  const result = {};
  for (const key of await tree.keys()) {
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

  return new ObjectTree(result);
}
