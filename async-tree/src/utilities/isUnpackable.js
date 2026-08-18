import isPacked from "./isPacked.js";

/**
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {any} object
 * @returns {object is Unpackable}
 */
export default function isUnpackable(object) {
  return (
    isPacked(object) &&
    typeof (/** @type {any} */ (object).unpack) === "function"
  );
}
