import getHandlers from "./getHandlers.js";
import { handleExtension } from "./handlers.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @typedef {import("@weborigami/async-tree").UnpackFunction} FileUnpackFunction
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function HandleExtensionsTransform(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);

      // Callers should set this to the set of supported extension handlers
      this.handlers = null;
    }

    async get(key) {
      const value = await super.get(key);
      const handlers = getHandlers(this);
      return handleExtension(this, value, key, handlers);
    }
  };
}
