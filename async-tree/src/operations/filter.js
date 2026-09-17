import * as args from "../utilities/args.js";
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
 * @returns {AsyncMap}
 */
export default function filter(maplike, options) {
  const { deep, test } = args.dictionaryOrFn(
    options,
    "Tree.filter",
    "test",
    {
      test: { type: "fn", required: true },
      deep: { type: "boolean", required: false },
    },
    { position: 2 },
  );
  const tree = args.map(maplike, "Tree.filter", { deep });

  return map(tree, {
    deep,

    description: "filter",

    // Assume source key is the same as result key
    inverseKey: async (resultKey) => resultKey,

    key: async (sourceValue, sourceKey, tree) => {
      const passes = await test(sourceValue, sourceKey, tree);
      return passes ? sourceKey : undefined;
    },
  });
}
