/**
 * Return true if the indicated object is an asynchronous tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} obj
 * @returns {obj is AsyncTree}
 */
export default function isAsyncTree(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.get === "function" &&
    typeof obj.keys === "function" &&
    // Regular JavaScript Map instances look like trees but can't have their
    // prototype chains extended (the way map() does), so exclude them.
    // Subclasses of Map that implement their own get() and keys() methods are
    // allowed, because they shouldn't have the same limitations.
    !(obj instanceof Map && Object.getPrototypeOf(obj) === Map.prototype)
  );
}
