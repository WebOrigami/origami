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

      // If the value is string-like and the key has an extension, look for a
      // loader that handles that extension and call it. The value will
      // typically be a Buffer loaded from the file system, but could also be a
      // string-like object defined by a user function.
      if (isStringLike(value) && isStringLike(key)) {
        const extension = extname(String(key)).toLowerCase().slice(1);
        if (extension) {
          /** @type {any} */
          const scope = Scope.getScope(this);
          /** @type {FileUnpackFunction} */
          const unpackFn = await Tree.traverse(scope, "@loaders", extension);
          if (unpackFn) {
            const input = value;
            // If the input is a plain string, convert it to a String so we can
            // attach data to it.
            value = new String(input);
            const parent = this;
            value.parent = parent;
            value.unpack = () => unpackFn(input, { key, parent });
          }
        }
      }

      return value;
    }
  };
}
