import crypto from "node:crypto";
import deflatePaths from "./deflatePaths.js";
import map from "./map.js";
import sync from "./sync.js";

/**
 * Return a Map whose keys are paths for all resources in the map-based tree
 * and whose values are the hashes of those resources.
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 * @param {{ base?: string }} options
 * @returns {Promise<Map<string, string>>}
 */
export default async function manifest(maplike, options = {}) {
  const base = options.base ?? "";
  const deflated = await deflatePaths(maplike, { base });

  // Map values to hashes
  const mapped = await map(deflated, hash);
  const result = await sync(mapped);
  return result;
}

function hash(value, path) {
  const buffer = toBuffer(value, path);
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function toBuffer(value, path) {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  } else if (value instanceof String) {
    return new TextEncoder().encode(value.toString());
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else {
    throw new TypeError(`Couldn't convert to buffer: ${path}`);
  }
}
