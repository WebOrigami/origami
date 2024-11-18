import { handleExtension } from "./handlers.js";

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
      const value = await super.get(key);
      return handleExtension(this, value, key);
    }
  };
}
