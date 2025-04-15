import { assertIsTreelike } from "../utilities.js";
import map from "./map.js";

/**
 * Given trees `a` and `b`, return a filtered version of `a` where only the keys
 * that exist in `b` and have truthy values are kept. The filter operation is
 * deep: if a value from `a` is a subtree, it will be filtered recursively.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {function|any} options
 * @returns {AsyncTree}
 */
export default function filter2(treelike, options) {
  assertIsTreelike(treelike, "map");
  let testFn;
  let deep;
  if (typeof options === "function") {
    testFn = options;
    deep = false;
  } else {
    testFn = options.test;
    deep = options.deep ?? false;
  }

  return map(treelike, {
    deep,

    // Assume source key is the same as result key
    inverseKey: async (resultKey) => resultKey,

    key: async (sourceKey, tree) => {
      const value = await tree.get(sourceKey);
      const passes = await testFn(value, sourceKey, tree);
      return passes ? sourceKey : undefined;
    },
  });
}
