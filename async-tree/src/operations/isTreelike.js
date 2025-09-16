import isPlainObject from "../utilities/isPlainObject.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Returns true if the indicated object can be directly treated as an
 * asynchronous tree. This includes:
 *
 * - An object that implements the AsyncTree interface (including
 *   AsyncTree instances)
 * - A function
 * - An `Array` instance
 * - A `Map` instance
 * - A `Set` instance
 * - A plain object
 *
 * Note: the `from()` method accepts any JavaScript object, but `isTreelike`
 * returns `false` for an object that isn't one of the above types.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {any} obj
 * @returns {obj is Treelike}
 */
export default function isTreelike(obj) {
  return (
    isAsyncTree(obj) ||
    obj instanceof Array ||
    obj instanceof Function ||
    obj instanceof Map ||
    obj instanceof Set ||
    isPlainObject(obj)
  );
}
