import { Tree } from "@graphorigami/core";
import {
  getScope,
  isTransformApplied,
  transformObject,
} from "../common/utilities.js";

/**
 * Given a main tree of arbitrary depth, and a shallow secondary tree of
 * default values, this returns values as usual from the main tree. If a
 * requested key is missing from the main tree, but exists in the default
 * values tree, the value will be returned from that tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../..").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function DefaultValuesTransform(Base) {
  return class DefaultValues extends Base {
    constructor(...args) {
      super(...args);
      this.defaults = {};
    }

    async get(key) {
      // Ask the tree if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        const defaultValue = await this.defaults[key];
        const scope = getScope(this);
        value =
          defaultValue instanceof Function
            ? await defaultValue.call(scope, this)
            : defaultValue;
      }

      // Ensure this transform is applied to any subtree.
      if (
        Tree.isAsyncTree(value) &&
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
