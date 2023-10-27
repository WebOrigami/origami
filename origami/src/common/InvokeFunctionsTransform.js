import { Tree } from "@graphorigami/core";
import Scope from "../runtime/Scope.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../..").Constructor<AsyncTree>} AsyncTreeConstructor
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
  };
}
