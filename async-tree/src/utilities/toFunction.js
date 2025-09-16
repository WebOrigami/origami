import from from "../operations/from.js";
import isTreelike from "../operations/isTreelike.js";
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
    let fnPromise;
    /** @this {any} */
    return async function (...args) {
      if (!fnPromise) {
        // unpack() may return a function or a promise for a function; normalize
        // to a promise for a function
        const unpackPromise = Promise.resolve(
          /** @type {any} */ (obj).unpack()
        );
        fnPromise = unpackPromise.then((content) => toFunction(content));
      }
      const fn = await fnPromise;
      return fn.call(this, ...args);
    };
  } else if (isTreelike(obj)) {
    // Return a function that invokes the tree's getter.
    const tree = from(obj);
    return tree.get.bind(tree);
  } else {
    // Not a function
    return null;
  }
}
