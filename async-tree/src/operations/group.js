import { ObjectTree, Tree } from "../internal.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default async function group(treelike, groupKeyFn) {
  if (!treelike) {
    const error = new TypeError(`groupBy: The tree to group isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const tree = Tree.from(treelike);

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

    if (!Tree.isTreelike(groups)) {
      // A single value was returned
      groups = [groups];
    }
    groups = Tree.from(groups);

    // Add the value to each group.
    for (const group of await Tree.values(groups)) {
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
