import getRealmObjectPrototype from "./getRealmObjectPrototype.js";

/**
 * Return true if the object is a string or object with a non-trival `toString`
 * method.
 *
 * @typedef {import("../../index.ts").Stringlike} Stringlike
 *
 * @param {any} object
 * @returns {obj is Stringlike}
 */
export default function isStringlike(object) {
  if (typeof object === "string") {
    return true;
  } else if (typeof object === "symbol") {
    return false;
  } else if (object?.toString === undefined) {
    return false;
  } else if (object.toString === getRealmObjectPrototype(object)?.toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}
