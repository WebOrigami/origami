import * as args from "../utilities/args.js";
import isUnpackable from "../utilities/isUnpackable.js";
import isMap from "./isMap.js";
import keys from "./keys.js";

/**
 * Does a pairwise invocation of `combineFn` for each value in the two trees. If
 * one tree has a key that the other doesn't, the  `combineFn` will be invoked
 * with `undefined` for the missing value.
 *
 * This returns a new tree of all the results of the `combineFn` invocations
 * that were not `undefined`. If all results were `undefined`, the overall
 * result is itself `undefined`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike1
 * @param {Maplike} maplike2
 * @param {function} combineFn
 */
export default async function combine(maplike1, maplike2, combineFn) {
  const tree1 = await args.map(maplike1, "Tree.combine", {
    deep: true,
    position: 1,
  });
  const tree2 = await args.map(maplike2, "Tree.combine", {
    deep: true,
    position: 2,
  });

  if (isUnpackable(combineFn)) {
    combineFn = await combineFn.unpack();
  }
  const fn = args.fn(combineFn, "Tree.combine", {
    position: 3,
  });

  const keys1 = await keys(tree1);
  const keys2 = await keys(tree2);
  const combinedKeys = new Set([...keys1, ...keys2]);

  const result = {};

  for (const key of combinedKeys) {
    const value1 = await tree1.get(key);
    const value2 = await tree2.get(key);

    const combination =
      isMap(value1) && isMap(value2)
        ? await combine(value1, value2, fn)
        : await fn(value1, value2);

    if (combination !== undefined) {
      result[key] = combination;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
