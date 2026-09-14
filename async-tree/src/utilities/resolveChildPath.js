import * as trailingSlash from "../trailingSlash.js";

/**
 * Resolve the path of a child key relative to a base path and throw an
 * exception if the child key is the empty string or a dot key (`.` or `..`) or
 * contains an interior slash.
 */
export function required(base, key) {
  const resolved = optional(base, key);
  if (resolved === undefined) {
    throw new Error(
      `A child key cannot be empty, a dot key, or contain an interior slash: "${key}"`,
    );
  }
  return resolved;
}

/**
 * Resolve the path of a child key relative to a base path. This returns
 * `undefined` if the child key is the empty string or a dot key (`.` or `..`)
 * or contains an interior slash.
 */
export function optional(base, key) {
  if (typeof key !== "string") {
    throw new Error(
      `Invalid child key: expected a string but received ${typeof key}`,
    );
  }

  const normalized = trailingSlash.remove(key);
  if (
    normalized === "" ||
    normalized === "." ||
    normalized === ".." ||
    normalized.includes("/") // Interior slash
  ) {
    return undefined;
  }

  return base ? trailingSlash.add(base) + key : key;
}
