import { map, Tree } from "@weborigami/async-tree";
import Scope from "./Scope.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 */
export default function functionResultsMap(treelike) {
  return map(treelike, {
    description: "functionResultsMap",

    value: async (sourceValue, sourceKey, tree) => {
      let resultValue;
      if (typeof sourceValue === "function") {
        const scope = Scope.getScope(tree);
        resultValue = await sourceValue.call(scope);
        if (Tree.isAsyncTree(resultValue)) {
          resultValue.parent = tree;
        }
      } else {
        resultValue = sourceValue;
      }
      return resultValue;
    },
  });
}
