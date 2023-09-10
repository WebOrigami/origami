import { DictionaryHelpers } from "@graphorigami/core";
import {
  getScope,
  isTransformApplied,
  transformObject,
} from "../common/utilities.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function DefaultValuesTransform(Base) {
  return class DefaultValues extends Base {
    constructor(...args) {
      super(...args);
      this.defaults = {};
    }

    async get(key) {
      // Ask the graph if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The graph doesn't have the key; try the defaults.
        const defaultValue = await this.defaults[key];
        const scope = getScope(this);
        value =
          defaultValue instanceof Function
            ? await defaultValue.call(scope, this)
            : defaultValue;
      }

      // Ensure this transform is applied to any subgraph.
      if (
        DictionaryHelpers.isAsyncDictionary(value) &&
        !isTransformApplied(DefaultValuesTransform, value)
      ) {
        value = transformObject(DefaultValuesTransform, value);
      }

      if (value?.defaults) {
        Object.assign(value.defaults, this.defaults);
      }

      return value;
    }
  };
}
