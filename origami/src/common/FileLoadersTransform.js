import { isPlainObject, isStringLike } from "@graphorigami/core";
import builtinLoaders from "../builtins/@loaders.js";
import { extname, getScope, keySymbol } from "../common/utilities.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../..").Constructor<AsyncTree>} AsyncTreeConstructor
 * @typedef {import("../../index.js").FileUnpackFunction} FileUnpackFunction
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function FileLoadersTransform(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this._loadersPromise = null;
    }

    async get(key) {
      let value = await super.get(key);

      // If the value is string-like and the key has an extension, look for a
      // loader that handles that extension and call it. The value will
      // typically be a Buffer loaded from the file system, but could also be a
      // string defined by a user function.
      if (isStringLike(value) && isStringLike(key)) {
        const extension = extname(String(key)).toLowerCase().slice(1);
        if (extension) {
          const loaders = await this.loaders();
          /** @type {FileUnpackFunction} */
          const unpackFn = await loaders.get(extension);
          if (unpackFn) {
            const input = value;
            // If the input is a plain string, convert it to a String so we can
            // attach data to it.
            value = new String(input);
            const parent = this;
            value.parent = parent;
            value.unpack = () => unpackFn(input, { key, parent });
          }

          // Add diagnostic information.
          if (value && typeof value === "object" && !isPlainObject(value)) {
            value[keySymbol] = key;
          }
        }
      }

      return value;
    }

    async loaders() {
      if (!this._loadersPromise) {
        // Give the scope a chance to contribute loaders, otherwise fall back to
        // the built-in loaders.
        const scope = getScope(this);
        this._loadersPromise = scope
          .get("@loaders")
          .then((customLoaders) => customLoaders ?? builtinLoaders);
      }
      return this._loadersPromise;
    }
  };
}
