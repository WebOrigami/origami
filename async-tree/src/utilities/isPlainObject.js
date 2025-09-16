import getRealmObjectPrototype from "./getRealmObjectPrototype.js";

/**
 * Return true if the object is a plain JavaScript object created by `{}`,
 * `new Object()`, or `Object.create(null)`.
 *
 * This function also considers object-like things with no prototype (like a
 * `Module`) as plain objects.
 *
 * @typedef {import("../../index.ts").PlainObject} PlainObject
 *
 * @param {any} obj
 * @returns {obj is PlainObject}
 */
export default function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(obj) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(obj) === getRealmObjectPrototype(obj);
}
