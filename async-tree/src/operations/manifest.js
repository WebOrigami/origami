import crypto from "node:crypto";
import map from "./map.js";
import sync from "./sync.js";

/**
 * Return a map whose values are the hashes of the original values.
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 * @returns {Promise<Map<string, string>>}
 */
export default async function manifest(maplike) {
  const mapped = await map(maplike, { deep: true, value: hash });
  const result = await sync(mapped);
  return result;
}

function hash(value, key) {
  const buffer = toBuffer(value, key);
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function toBuffer(value, key) {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  } else if (value instanceof String) {
    return new TextEncoder().encode(value.toString());
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else {
    throw new TypeError(`Couldn't convert to buffer: ${key}`);
  }
}
