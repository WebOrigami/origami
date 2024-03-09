import { isStringLike } from "@weborigami/async-tree";
import Scope from "./Scope.js";
import attachFileLoader from "./attachFileLoader.js";

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

      // If the key is string-like and has an extension, attach a loader (if one
      // exists) that handles that extension.
      if (value && isStringLike(key)) {
        const scope = Scope.getScope(this);
        value = await attachFileLoader(scope, String(key), value, this);
      }

      return value;
    }
  };
}
