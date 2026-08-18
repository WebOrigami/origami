import TypedArray from "./TypedArray.js";

/**
 * Return true if the object is in a packed form (or can be readily packed into
 * a form) that can be given to fs.writeFile or response.write().
 *
 * @typedef {import("../../index.ts").Packed} Packed
 *
 * @param {any} object
 * @returns {object is Packed}
 */
export default function isPacked(object) {
  return (
    typeof object === "string" ||
    object instanceof ArrayBuffer ||
    object instanceof ReadableStream ||
    object instanceof String ||
    object instanceof TypedArray
  );
}
