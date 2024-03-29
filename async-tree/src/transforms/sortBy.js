import * as Tree from "../Tree.js";

/**
 * Return a transform function that sorts a tree's keys.
 *
 * The given `sortKeyFn` is invoked for each key/value pair in the tree, and
 * should produce a sort key for that pair. The sort keys are then compared to
 * determine the sort order for the tree's keys.
 *
 * @param {import("./map.js").KeyFn} sortKeyFn
 */
export default function createSortByTransform(sortKeyFn) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function sortByTransform(treelike) {
    const tree = Tree.from(treelike);
    const transform = Object.create(tree);
    transform.keys = async () => {
      const keysAndSortKeys = [];
      for (const key of await tree.keys()) {
        const sortKey = await sortKeyFn(key, tree);
        keysAndSortKeys.push({ key, sortKey });
      }
      keysAndSortKeys.sort((a, b) =>
        a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
      );
      const sortedKeys = keysAndSortKeys.map(({ key }) => key);
      return sortedKeys;
    };
    return transform;
  };
}
