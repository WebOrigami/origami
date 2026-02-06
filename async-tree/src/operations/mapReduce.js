import * as args from "../utilities/args.js";
import isMap from "./isMap.js";

/**
 * Map and reduce a `source` tree.
 *
 * Each of the tree's values will be requested in an asynchronous call, then
 * those results will be awaited collectively. If a valueFn is provided, it will
 * be invoked to convert each value to a mapped value; if the valueFn is null or
 * undefined, values will be used as is, although any Promise values will be
 * awaited.
 *
 * The resolved values will be added to a regular `Map` with the same keys as
 * the source. This `Map` will be passed to the reduceFn, along with the
 * original `source`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ReduceFn} ReduceFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {Maplike} source
 * @param {ValueKeyFn|null} valueFn
 * @param {ReduceFn} reduceFn
 */
export default async function mapReduce(source, valueFn, reduceFn) {
  const sourceMap = await args.map(source, "Tree.mapReduce");

  // We're going to fire off all the get requests in parallel, as quickly as
  // the keys come in. We call the tree's `get` method for each key, but
  // *don't* wait for it yet.
  const mapped = new Map();
  const promises = [];
  for await (const key of sourceMap.keys()) {
    mapped.set(key, null); // placeholder
    const promise = (async () => {
      const value = await sourceMap.get(key);
      return isMap(value)
        ? mapReduce(value, valueFn, reduceFn) // subtree; recurse
        : valueFn
          ? valueFn(value, key, sourceMap)
          : value;
    })();
    promises.push(promise);
  }

  // Wait for all the promises to resolve. Because the promises were captured
  // in the same order as the keys, the values will also be in the same order.
  const values = await Promise.all(promises);

  // Replace the placeholders with the actual values.
  const keys = Array.from(mapped.keys());
  for (let i = 0; i < values.length; i++) {
    mapped.set(keys[i], values[i]);
  }

  // Reduce the values to a single result.
  return reduceFn(mapped, sourceMap);
}
