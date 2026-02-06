import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import keys from "./keys.js";

/**
 * Return a new map with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 * @typedef {(key: any, map: SyncOrAsyncMap) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }} SortOptions
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {Maplike} maplike
 * @param {SortOptions|ValueKeyFn} [options]
 */
export default async function sort(maplike, options) {
  const source = await args.map(maplike, "Tree.sort");

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
      return source.get(key);
    },

    async *keys() {
      const treeKeys = await keys(source);

      let resultKeys;
      if (sortKey) {
        // Invoke the async sortKey function to get sort keys.
        // Create { key, sortKey } tuples.
        const tuples = await Promise.all(
          treeKeys.map(async (key) => {
            const value = await source.get(key);
            const sort = await sortKey(value, key, source);
            if (sort === undefined) {
              throw new Error(
                `sortKey function returned undefined for key ${key}`,
              );
            }
            return { key, sort };
          }),
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

    source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });

  return transformed;
}
