import from from "../operations/from.js";
import isMaplike from "../operations/isMaplike.js";

/**
 * Convert the given object to a function.
 *
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @param {Invocable} obj
 * @returns {Function|null}
 */
export default function toFunction(obj) {
  if (typeof obj === "function") {
    // Return a function as is.
    return obj;
  } else if (isMaplike(obj)) {
    // Return a function that invokes the tree's getter.
    const tree = from(obj);
    return tree.get.bind(tree);
  } else {
    // Not a function
    return null;
  }
}
