import getTreeArgument from "../utilities/getTreeArgument.js";
import map from "./map.js";

/**
 * Given a tree an a test function, return a new tree whose keys correspond to
 * the values that pass the test function.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {function|any} options
 * @returns {Promise<AsyncTree>}
 */
export default async function filter(treelike, options) {
  let testFn;
  let deep;
  if (typeof options === "function") {
    testFn = options;
    deep = false;
  } else {
    testFn = options.test;
    deep = options.deep ?? false;
  }

  const tree = await getTreeArgument(treelike, "filter", { deep });
  return map(tree, {
    deep,

    description: "filter",

    // Assume source key is the same as result key
    inverseKey: async (resultKey) => resultKey,

    key: async (sourceValue, sourceKey, tree) => {
      const passes = await testFn(sourceValue, sourceKey, tree);
      return passes ? sourceKey : undefined;
    },
  });
}
