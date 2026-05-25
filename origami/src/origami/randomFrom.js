import hashBytes from "../common/hashBytes.js";

/**
 * Given a block of seed data, derive a pseudo-random 32-bit integer.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} data
 * @return {number}
 */
export default function randomFrom(data) {
  // Extract the first 32-bit integer from the hash to use as the random number
  const hash = hashBytes(data);
  return hash.readUInt32LE(0);
}
