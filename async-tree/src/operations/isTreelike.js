import isPlainObject from "../utilities/isPlainObject.js";
import isMap from "./isMap.js";

/**
 * Returns true if the indicated object can be directly treated as map. This
 * includes:
 *
 * - A function
 * - An `Array` instance
 * - A `Map` instance
 * - An `AsyncMap` instance
 * - A `Set` instance
 * - A plain object
 *
 * Note: the `from()` method accepts any JavaScript object, but `isMaplike`
 * returns `false` for an object that isn't one of the above types.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {any} obj
 * @returns {obj is Maplike}
 */
export default function isMaplike(obj) {
  return (
    isMap(obj) ||
    obj instanceof Array ||
    obj instanceof Function ||
    obj instanceof Set ||
    isPlainObject(obj)
  );
}
