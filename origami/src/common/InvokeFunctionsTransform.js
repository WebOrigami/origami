import { Tree } from "@graphorigami/core";
import { getScope } from "./utilities.js";

/**
 * When using `get` to retrieve a value from a tree, if the value is a
 * function, invoke it and return the result.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function InvokeFunctionsTransform(Base) {
  return class InvokeFunctions extends Base {
    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        const scope = getScope(this);
        value = await value.call(scope);

        if (Tree.isAsyncTree(value)) {
          value.parent2 = this;
        }
      }
      return value;
    }
  };
}
