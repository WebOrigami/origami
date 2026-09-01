import crypto from "node:crypto";
import pack from "../utilities/pack.js";
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
  const buffer = pack(value, key);
  return crypto.createHash("sha1").update(buffer).digest("hex");
}
