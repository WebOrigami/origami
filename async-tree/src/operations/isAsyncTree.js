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
    typeof obj.keys === "function"
  );
}
