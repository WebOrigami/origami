import getMapArgument from "../utilities/getMapArgument.js";
import map from "./map.js";

/**
 * Given a tree an a test function, return a new tree whose keys correspond to
 * the values that pass the test function.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 *
 * @param {Maplike} maplike
 * @param {function|any} options
 * @returns {Promise<AsyncMap>}
 */
export default async function filter(maplike, options) {
  let testFn;
  let deep;
  if (typeof options === "function") {
    testFn = options;
    deep = false;
  } else {
    testFn = options.test;
    deep = options.deep ?? false;
  }

  const tree = await getMapArgument(maplike, "Tree.filter", { deep });
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
