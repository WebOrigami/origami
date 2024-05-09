import { Tree } from "../internal.js";

/**
 * Return a transform function that sorts a tree's keys using a comparison
 * function.
 *
 * If the `options` include a `sortKey` function, that will be invoked for each
 * key in the tree to produce a sort key. If no `sortKey` function is provided,
 * the original keys will be used as sort keys.
 *
 * If the `options` include a `compare` function, that will be used to compare
 * sort keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {(key: any, tree: AsyncTree) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }}
 * SortOptions
 *
 * @param {SortOptions} [options]
 */
export default function sortFn(options) {
  const sortKey = options?.sortKey;
  let compare = options?.compare;

  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function sort(treelike) {
    const tree = Tree.from(treelike);
    const transform = Object.create(tree);
    transform.keys = async () => {
      const keys = Array.from(await tree.keys());

      let sortKeys;
      if (sortKey) {
        // Invoke the async sortKey function to get sort keys.
        sortKeys = await Promise.all(
          keys.map(async (key) => {
            return {
              key,
              sort: await sortKey(key, tree),
            };
          })
        );

        // Wrap the comparison function so it applies to sort keys.
        const defaultCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
        const originalCompare = compare ?? defaultCompare;
        compare = (a, b) => originalCompare(a.sort, b.sort);
      } else {
        // Use original keys as sort keys.
        sortKeys = keys;
      }

      const sorted = sortKeys.sort(compare);
      return sortKey
        ? // Map back to the original keys.
          sorted.map((pair) => pair.key)
        : sorted;
    };
    return transform;
  };
}
