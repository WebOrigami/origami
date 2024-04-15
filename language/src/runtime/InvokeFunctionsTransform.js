import { Tree } from "@weborigami/async-tree";
import Scope from "./Scope.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function InvokeFunctionsTransform(Base) {
  return class InvokeFunctions extends Base {
    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        const scope = Scope.getScope(this);
        value = await value.call(scope);

        if (Tree.isAsyncTree(value)) {
          value.parent = this;
        }
      }
      return value;
    }

    // Need to evaluate the value before checking if it is a tree.
    async isKeyForSubtree(key) {
      const value = await this.get(key);
      return Tree.isAsyncTree(value);
    }
  };
}
