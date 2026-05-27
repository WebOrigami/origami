import hashBytes from "../common/hashBytes.js";

/**
 * Given a block of seed data, return a function that produces a sequence of
 * pseudo-random 32-bit integers.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} data
 * @return {function(): number}
 */
export default function randomsFrom(data) {
  const hash = hashBytes(data);

  // Extract four 32-bit integers from the hash to use as the initial state of
  // the pseudo-random number generator
  const a = hash.readUInt32LE(0);
  const b = hash.readUInt32LE(4);
  const c = hash.readUInt32LE(8);
  const d = hash.readUInt32LE(12);

  const prng = xoshiro128ss(a, b, c, d);
  return prng;
}

// Rotate left (circular left shift) for 32-bit integers
function rotl(x, k) {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/**
 * Pseudo-random number generator based on the xoshiro128** algorithm. See
 * the 256-bit variant: https://en.wikipedia.org/wiki/Xorshift#xoshiro256**
 *
 * Unlike a typical implementation, this directly returns a 32-bit integer
 * instead of a float.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @returns {function(): number}
 */
function xoshiro128ss(a, b, c, d) {
  let s0 = a >>> 0;
  let s1 = b >>> 0;
  let s2 = c >>> 0;
  let s3 = d >>> 0;

  return function () {
    const result = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;

    const t = (s1 << 9) >>> 0;

    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;

    s2 ^= t;
    s3 = rotl(s3, 11);

    return result;
  };
}
