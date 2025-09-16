import * as trailingSlash from "../trailingSlash.js";

/**
 * Return a slash-separated path for the given keys.
 *
 * This takes care to avoid adding consecutive slashes if they keys themselves
 * already have trailing slashes.
 *
 * @param {string[]} keys
 */
export default function pathFromKeys(keys) {
  // Ensure there's a slash between all keys. If the last key has a trailing
  // slash, leave it there.
  const normalized = keys.map((key, index) =>
    index < keys.length - 1 ? trailingSlash.add(key) : key
  );
  return normalized.join("");
}
