import * as trailingSlash from "../trailingSlash.js";

/**
 * Resolve the path of a child key relative to a base path. This throws if the
 * child key is the empty string or a dot key (`.` or `..`) or contains an
 * interior slash.
 */
export default function resolveChildPath(base, key) {
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
    throw new Error(`Invalid child key: "${key}"`);
  }

  return trailingSlash.add(base) + key;
}
