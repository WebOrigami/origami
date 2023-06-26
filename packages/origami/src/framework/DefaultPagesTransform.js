/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import index from "../builtins/@index.js";
import DefaultValues from "../common/DefaultValuesTransform.js";
import defaultKeysJson from "./defaultKeysJson.js";

/**
 * @param {Constructor<AsyncDictionary>} Base
 */
export default function DefaultPagesTransform(Base) {
  return class DefaultPages extends DefaultValues(Base) {
    constructor(...args) {
      super(...args);
      Object.assign(this.defaults, {
        ".keys.json": defaultKeysJson,
        "index.html": index,
      });
    }
  };
}
