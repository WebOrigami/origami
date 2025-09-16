import isPacked from "./isPacked.js";

/**
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {any} obj
 * @returns {obj is Unpackable}
 */
export default function isUnpackable(obj) {
  return (
    isPacked(obj) && typeof (/** @type {any} */ (obj).unpack) === "function"
  );
}
