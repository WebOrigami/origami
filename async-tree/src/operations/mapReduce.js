import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Map and reduce a tree.
 *
 * This is done in as parallel fashion as possible. Each of the tree's values
 * will be requested in an asynchronous call, then those results will be awaited
 * collectively. If a mapFn is provided, it will be invoked to convert each
 * value to a mapped value; otherwise, values will be used as is. When the
 * values have been obtained, all the values and keys will be passed to the
 * reduceFn, which should consolidate those into a single result.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ReduceFn} ReduceFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {Treelike} treelike
 * @param {ValueKeyFn|null} mapFn
 * @param {ReduceFn} reduceFn
 */
export default async function mapReduce(treelike, mapFn, reduceFn) {
  const tree = from(treelike);

  // We're going to fire off all the get requests in parallel, as quickly as
  // the keys come in. We call the tree's `get` method for each key, but
  // *don't* wait for it yet.
  const treeKeys = [];
  const promises = [];
  for await (const key of tree.keys()) {
    treeKeys.push(key);
    const promise = (async () => {
      const value = await tree.get(key);
      return isAsyncTree(value)
        ? mapReduce(value, mapFn, reduceFn) // subtree; recurse
        : mapFn
        ? mapFn(value, key, tree)
        : value;
    })();
    promises.push(promise);
  }

  // Wait for all the promises to resolve. Because the promises were captured
  // in the same order as the keys, the values will also be in the same order.
  const values = await Promise.all(promises);

  // Reduce the values to a single result.
  return reduceFn(values, treeKeys, tree);
}
