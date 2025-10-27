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

    get(key) {
      const value = super.get(key);
      return value instanceof Promise
        ? value.then((resolved) => handleExtension(resolved, key, this))
        : handleExtension(value, key, this);
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
