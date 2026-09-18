/** Edit this ASYNC version to generate the sync version. */

import keys from "../operations/keys.js";
import withKeys from "../operations/withKeys.js";

/**
 * Return a generator that yields the sorted keys.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {SyncOrAsyncMap} source
 * @param {(a: any, b: any) => number} compare
 * @param {(value: any, key: any, source: SyncOrAsyncMap) => any} sortKey
 */
export default function sort(source, compare, sortKey) {
  async function* sortedKeys() {
    const treeKeys = await keys(source);

    let resultKeys;
    if (sortKey) {
      // Invoke the async sortKey function to get sort keys.
      // Create { key, sortKey } tuples.
      const promises = treeKeys.map(async (key) => {
        const value = await source.get(key);
        const sort = await sortKey(value, key, source);
        if (sort === undefined) {
          throw new Error(`sortKey function returned undefined for key ${key}`);
        }
        return { key, sort };
      });
      const tuples = await Promise.all(promises);

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
  }

  return withKeys(source, sortedKeys, { description: "sort" });
}
