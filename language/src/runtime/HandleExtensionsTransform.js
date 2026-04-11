import { Tree } from "@weborigami/async-tree";
import initializeGlobalsForTree from "../project/initializeGlobalsForTree.js";
import handleExtension from "./handleExtension.js";

/**
 * @typedef {import("../../index.ts").Constructor<Map>} MapConstructor
 * @typedef {import("@weborigami/async-tree").UnpackFunction} FileUnpackFunction
 *
 * @param {MapConstructor} Base
 */
export default function HandleExtensionsTransform(Base) {
  class HandleExtensions extends Base {
    // Implement delete (and set) to keep the Map read-write
    delete(key) {
      return super.delete(key);
    }

    /**
     * Initialize the globals on the project root. This makes the file handlers
     * available for use from any folder inside the tree.
     *
     * This is an async operation because it can load JavaScript files, so it
     * can't be done in the constructor.
     */
    async initializeGlobals() {
      await initializeGlobalsForTree(this);
    }

    get(key) {
      const value = super.get(key);
      const root = Tree.root(this);
      const globals = root.globals;
      return handleExtension(value, key, globals, this);
    }

    // See delete()
    set(key, value) {
      return super.set(key, value);
    }
  }

  if (Base.prototype.readOnly) {
    // Remove delete and set methods to keep the Map read-only. The base delete
    // and set methods will exist (because it's a Map) but for our purposes the
    // class is read-only.

    // @ts-ignore
    delete HandleExtensions.prototype.delete;
    // @ts-ignore
    delete HandleExtensions.prototype.set;
  }

  return HandleExtensions;
}
