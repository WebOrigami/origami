import { Tree } from "../internal.js";

/**
 * Return a new tree with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {(key: any, tree: AsyncTree) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }}
 * SortOptions
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {SortOptions} [options]
 */
export default function sort(treelike, options) {
  if (!treelike) {
    const error = new TypeError(`sort: The tree to sort isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const sortKey = options?.sortKey;
  let compare = options?.compare;

  const tree = Tree.from(treelike);
  const transformed = Object.create(tree);
  transformed.keys = async () => {
    const keys = Array.from(await tree.keys());

    if (sortKey) {
      // Invoke the async sortKey function to get sort keys.
      // Create { key, sortKey } tuples.
      const tuples = await Promise.all(
        keys.map(async (key) => {
          const sort = await sortKey(key, tree);
          if (sort === undefined) {
            throw new Error(
              `sortKey function returned undefined for key ${key}`
            );
          }
          return { key, sort };
        })
      );

      // Wrap the comparison function so it applies to sort keys.
      const defaultCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
      const originalCompare = compare ?? defaultCompare;
      // Sort by the sort key.
      tuples.sort((a, b) => originalCompare(a.sort, b.sort));
      // Map back to the original keys.
      const sorted = tuples.map((pair) => pair.key);
      return sorted;
    } else {
      // Use original keys as sort keys.
      // If compare is undefined, this uses default sort order.
      return keys.slice().sort(compare);
    }
  };
  return transformed;
}
