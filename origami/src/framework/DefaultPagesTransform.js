import { keysJson } from "@graphorigami/core";
import index from "../builtins/@index.js";
import DefaultValues from "../common/DefaultValuesTransform.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../..").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function DefaultPagesTransform(Base) {
  return class DefaultPages extends DefaultValues(Base) {
    constructor(...args) {
      super(...args);
      Object.assign(this.defaults, {
        ".keys.json": function () {
          return keysJson.stringify(this);
        },
        "index.html": index,
      });
    }
  };
}
