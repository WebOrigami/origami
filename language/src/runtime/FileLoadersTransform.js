import { Tree, isStringLike } from "@weborigami/async-tree";
import Scope from "./Scope.js";
import extname from "./extname.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @typedef {import("../../index.js").FileUnpackFunction} FileUnpackFunction
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function FileLoadersTransform(Base) {
  return class FileLoaders extends Base {
    async get(key) {
      let value = await super.get(key);

      // If the key is string-like and has an extension, look for a loader that
      // handles that extension.
      if (value && isStringLike(key)) {
        const extension = extname(String(key)).toLowerCase().slice(1);
        if (extension) {
          /** @type {any} */
          const scope = Scope.getScope(this);
          const loader = await Tree.traverse(scope, "@loaders", extension);
          if (loader) {
            const input = value;
            // If the input is a plain string, convert it to a String so we can
            // attach data to it.
            if (typeof input === "string") {
              value = new String(input);
            } else if (value instanceof Buffer) {
              value = Buffer.from(value);
            }

            // TODO: We want to be able to use the value without having to copy it,
            // but we also don't want the resulting object (with an unpack method)
            // to be treated as an AsyncTree by processUnpackedContent.

            const parent = this;

            // TODO: Move parentSymbol to language package, use it here.
            // value[utilities.parentSymbol] = parent;

            // value.parent = parent;
            Object.defineProperty(value, "parent", {
              value: parent,
              // enumerable: false,
              // writable: true,
              // configurable: true,
            });
            value.unpack = loader.bind(null, input, { key, parent });
          }
        }
      }

      return value;
    }
  };
}
