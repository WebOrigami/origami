import isAsyncTree from "./isAsyncTree.js";

/**
 * Return true if the indicated object is an asynchronous mutable tree.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 *
 * @param {any} obj
 * @returns {obj is AsyncMutableTree}
 */
export default function isAsyncMutableTree(obj) {
  return (
    isAsyncTree(obj) && typeof (/** @type {any} */ (obj).set) === "function"
  );
}
