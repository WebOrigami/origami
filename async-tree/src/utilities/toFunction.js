import from from "../operations/from.js";
import isMaplike from "../operations/isMaplike.js";
import isUnpackable from "./isUnpackable.js";

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
  } else if (isUnpackable(obj)) {
    // Extract the contents of the object and convert that to a function.
    const unpacked = /** @type {any} */ (obj).unpack();
    if (unpacked instanceof Promise) {
      return async function (...args) {
        const fn = toFunction(await unpacked);
        if (fn === null) {
          throw new TypeError("unpack() did not return a function");
        }
        return fn(...args);
      };
    } else {
      const fn = toFunction(unpacked);
      if (fn === null) {
        throw new TypeError("unpack() did not return a function");
      }
      return fn;
    }
  } else if (isMaplike(obj)) {
    // Return a function that invokes the tree's getter.
    const tree = from(obj);
    return tree.get.bind(tree);
  } else {
    // Not a function
    return null;
  }
}
