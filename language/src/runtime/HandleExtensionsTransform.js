import handleExtension from "./handleExtension.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @typedef {import("@weborigami/async-tree").UnpackFunction} FileUnpackFunction
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function HandleExtensionsTransform(Base) {
  return class HandleExtensions extends Base {
    get(key) {
      const value = super.get(key);
      return value instanceof Promise
        ? value.then((resolved) => handleExtension(resolved, key, this))
        : handleExtension(value, key, this);
    }
  };
}
