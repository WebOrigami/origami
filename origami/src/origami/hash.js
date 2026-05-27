import hashBytes from "../common/hashBytes.js";

/**
 * Given string or Uint8Array data, return a hex-encoded hash of that data.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} data
 */
export default function hash(data) {
  const bytes = hashBytes(data);
  const text = Array.from(bytes)
    .slice(0, 20) // Limit to first 20 bytes (160 bits) for a shorter hash string
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return text;
}
