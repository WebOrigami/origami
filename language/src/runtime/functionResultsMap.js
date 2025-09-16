import { Tree } from "@weborigami/async-tree";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 */
export default async function functionResultsMap(treelike) {
  return Tree.map(treelike, {
    description: "functionResultsMap",

    value: async (sourceValue, sourceKey, tree) => {
      const resultValue =
        typeof sourceValue === "function"
          ? await sourceValue.call(tree)
          : sourceValue;
      return resultValue;
    },
  });
}
