import { toString } from "@weborigami/async-tree";
import { createHash } from "node:crypto";

/**
 * Given a block of seed data, return a seeded random number generator function
 * that produces a sequence of pseudo-random numbers in the range [0, 1).
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} seedData
 * @return {function(): number}
 */
export default function randomBasedOn(seedData) {
  let bytes;
  if (seedData instanceof Uint8Array) {
    bytes = seedData;
  } else {
    const text = toString(seedData);
    if (!text) {
      throw new TypeError("Seed data must be a string or Uint8Array");
    }
    bytes = new TextEncoder().encode(text);
  }

  // Hash the seed data to produce a 128-bit value
  const hash = createHash("sha256").update(bytes).digest();

  // Extract four 32-bit integers from the hash to use as the initial state of
  // the pseudo-random number generator
  const a = hash.readUInt32LE(0);
  const b = hash.readUInt32LE(4);
  const c = hash.readUInt32LE(8);
  const d = hash.readUInt32LE(12);

  const prng = xoshiro128ss(a, b, c, d);
  return prng;
}

/**
 * Pseudo-random number generator based on the xoshiro128** algorithm:
 * https://en.wikipedia.org/wiki/Xorshift#xoshiro256**
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

  function rotl(x, k) {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  return function () {
    const result = (rotl(Math.imul(s1, 5), 7) * 9) >>> 0;

    const t = (s1 << 9) >>> 0;

    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;

    s2 ^= t;
    s3 = rotl(s3, 11);

    return result / 4294967296;
  };
}
