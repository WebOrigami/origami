import TypedArray from "./TypedArray.js";

/**
 * Return true if the object is in a packed form (or can be readily packed into
 * a form) that can be given to fs.writeFile or response.write().
 *
 * @typedef {import("../../index.ts").Packed} Packed
 *
 * @param {any} obj
 * @returns {obj is Packed}
 */
export default function isPacked(obj) {
  return (
    typeof obj === "string" ||
    obj instanceof ArrayBuffer ||
    obj instanceof ReadableStream ||
    obj instanceof String ||
    obj instanceof TypedArray
  );
}
