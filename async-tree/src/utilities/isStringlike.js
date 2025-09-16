import getRealmObjectPrototype from "./getRealmObjectPrototype.js";

/**
 * Return true if the object is a string or object with a non-trival `toString`
 * method.
 *
 * @typedef {import("../../index.ts").Stringlike} Stringlike
 *
 * @param {any} obj
 * @returns {obj is Stringlike}
 */
export default function isStringlike(obj) {
  if (typeof obj === "string") {
    return true;
  } else if (obj?.toString === undefined) {
    return false;
  } else if (obj.toString === getRealmObjectPrototype(obj)?.toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}
