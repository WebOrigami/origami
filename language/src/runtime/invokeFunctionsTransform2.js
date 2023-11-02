import { createMapTransform } from "@graphorigami/async-tree";
import * as Tree from "@graphorigami/async-tree/src/Tree.js";
import Scope from "./Scope.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 *
 * @type {import("@graphorigami/async-tree").TreeTransform}
 */
export default function invokeFunctionsTransform(tree) {
  return createMapTransform({
    description: "invoke functions transform",

    valueFn: async (innerValue) => {
      let outerValue;
      if (typeof innerValue === "function") {
        const scope = Scope.getScope(tree);
        outerValue = await innerValue.call(scope);
        if (Tree.isAsyncTree(outerValue)) {
          outerValue.parent = tree;
        }
      } else {
        outerValue = innerValue;
      }
      return outerValue;
    },
  })(tree);
}
