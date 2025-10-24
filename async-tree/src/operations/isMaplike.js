import isPlainObject from "../utilities/isPlainObject.js";

/**
 * Returns true if the indicated object can be directly treated like a Map. This
 * includes:
 *
 * - A function
 * - An `Array` instance
 * - A `Map` instance
 * - A `Set` instance
 * - A plain object
 *
 * Note: the `from()` method accepts any JavaScript object, but `isMaplike`
 * returns `false` for an object that isn't one of the above types.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {any} object
 * @returns {obj is Maplike}
 */
export default function isMaplike(object) {
  return (
    object instanceof Array ||
    object instanceof Function ||
    object instanceof Map ||
    object instanceof Set ||
    isPlainObject(object)
  );
}
