import index from "../builtins/@index.js";
import DefaultValues from "../common/DefaultValuesTransform.js";
import defaultKeysJson from "./defaultKeysJson.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../core/types").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
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
