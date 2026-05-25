import { toString } from "@weborigami/async-tree";
import { createHash } from "node:crypto";

/**
 * Given data, return a 256-bit hash of that data. The data can be a string or a
 * Uint8Array.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} data
 */
export default function hash(data) {
  let bytes;
  if (data instanceof Uint8Array) {
    bytes = data;
  } else {
    const text = toString(data);
    if (!text) {
      throw new TypeError("Origami.hash: Data must be a string or Uint8Array");
    }
    bytes = new TextEncoder().encode(text);
  }

  const hash = createHash("sha256").update(bytes).digest();

  hash.toString = () => {
    return Array.from(hash)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  return hash;
}
