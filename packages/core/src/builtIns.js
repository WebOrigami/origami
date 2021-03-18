import AsyncExplorable from "./AsyncExplorable.js";
import asyncExplorableObject from "./asyncExplorableObject.js";
import Explorable from "./Explorable.js";
import explorablePlainObject from "./explorablePlainObject.js";

/**
 * Create an async-explorable version of the given built-in JavaScript object.
 * If the object is not one that can be made explorable, this returns null.
 *
 * @param {any} obj
 */
export function asyncExplorable(obj) {
  if (obj instanceof AsyncExplorable) {
    // Already async explorable
    return obj;
  } else if (isPlainObject(obj)) {
    return asyncExplorableObject(obj);
  } else {
    return null;
  }
}

/**
 * Create an explorable version of the given built-in JavaScript object.
 * If the object is not one that can be made explorable, this returns null.
 *
 * @param {any} obj
 */
export function explorable(obj) {
  if (obj instanceof Explorable) {
    // Already sync explorable
    return obj;
  } else if (isPlainObject(obj)) {
    return explorablePlainObject(obj);
  } else {
    return null;
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
