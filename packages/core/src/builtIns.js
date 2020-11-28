import explorableObject from "./explorableObject.js";

/**
 * Create an explorable version of the given built-in JavaScript object.
 *
 * @param {any} obj
 */
export function explore(obj) {
  if (isPlainObject(obj)) {
    return explorableObject(obj);
  } else {
    throw `builtIns.explore: object is not an explorable built-in JavaScript object: ${obj}`;
  }
}

/**
 * Return true if the object is a plain JavaScript object.
 *
 * @param {any} obj
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
