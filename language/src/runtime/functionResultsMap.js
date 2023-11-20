import { map, Tree } from "@graphorigami/async-tree";
import Scope from "./Scope.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 *
 * @type {import("@graphorigami/async-tree").TreeTransform}
 */
export default function functionResultsMap(tree) {
  return map({
    description: "functionResultsMap",

    valueMap: async (sourceValue, sourceKey, tree) => {
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
  })(tree);
}
