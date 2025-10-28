import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return a new tree with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {(key: any, tree: AsyncTree) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }} SortOptions
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {Treelike} treelike
 * @param {SortOptions|ValueKeyFn} [options]
 */
export default async function sort(treelike, options) {
  const tree = await getTreeArgument(treelike, "sort");

  let sortKey;
  let compare;
  if (options instanceof Function) {
    // Take the function as the `sortKey` option
    sortKey = options;
  } else {
    compare = options?.compare;
    sortKey = options?.sortKey;
  }

  const transformed = Object.assign(new AsyncMap(), {
    descriptor: "sort",

    async get(key) {
      return tree.get(key);
    },

    async *keys() {
      const treeKeys = await keys(tree);

      let resultKeys;
      if (sortKey) {
        // Invoke the async sortKey function to get sort keys.
        // Create { key, sortKey } tuples.
        const tuples = await Promise.all(
          treeKeys.map(async (key) => {
            const value = await tree.get(key);
            const sort = await sortKey(value, key, tree);
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
        resultKeys = tuples.map((pair) => pair.key);
      } else {
        // Use original keys as sort keys.
        // If compare is undefined, this uses default sort order.
        resultKeys = treeKeys.slice().sort(compare);
      }
      yield* resultKeys;
    },

    source: tree,
  });

  return transformed;
}
