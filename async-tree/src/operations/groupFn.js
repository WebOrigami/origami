import { ObjectTree, Tree } from "../internal.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default function createGroupByTransform(groupKeyFn) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return async function groupByTransform(treelike) {
    const tree = Tree.from(treelike);
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
      for (const groupKey of await groups.keys()) {
        const group = await groups.get(groupKey);
        result[group] ??= [];
        result[group].push(value);
      }
    }

    return new ObjectTree(result);
  };
}
