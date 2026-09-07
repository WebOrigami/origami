import { pack } from "@weborigami/async-tree";
import { createHash } from "node:crypto";

/**
 * Given data, return a 256-bit hash of that data. The data can be a string or a
 * Uint8Array.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Uint8Array|Stringlike} data
 */
export default function hashBytes(data) {
  const buffer = pack(data);
  const hash = createHash("sha256").update(buffer).digest();
  return hash;
}
