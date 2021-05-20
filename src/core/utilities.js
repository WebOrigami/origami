import ExplorableGraph from "./ExplorableGraph.js";
import ExplorableObject from "./ExplorableObject.js";

export function explore(obj) {
  return obj instanceof ExplorableGraph
    ? obj // Return object as is.
    : new ExplorableObject(obj);
}

export function isExplorable(obj) {
  return obj?.[Symbol.asyncIterator] !== undefined && obj?.get !== undefined;
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
