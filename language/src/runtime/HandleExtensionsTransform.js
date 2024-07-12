import { isStringLike } from "@weborigami/async-tree";
import handleExtension from "./handleExtension.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @typedef {import("../../index.ts").UnpackFunction} FileUnpackFunction
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function HandleExtensionsTransform(Base) {
  return class FileLoaders extends Base {
    async get(key) {
      let value = await super.get(key);

      // If the value is packed (writable to disk),
      // If the key is string-like and has an extension, attach a loader (if one
      // exists) that handles that extension.
      if (value && isStringLike(key)) {
        value = await handleExtension(this, String(key), value);
      }

      return value;
    }
  };
}
