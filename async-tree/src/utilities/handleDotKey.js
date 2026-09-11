import * as trailingSlash from "../trailingSlash.js";

export default function handleDotKey(map, key) {
  const normalized = trailingSlash.remove(key);

  if (normalized === ".") {
    // Return the map itself
    return map;
  }

  if (normalized === "..") {
    // Return the parent, but only if it exists and is of the same type
    const parent = map.parent;
    if (parent?.constructor === map.constructor) {
      return parent;
    } else {
      const message = map.path
        ? `Cannot use ".." to navigate to parent of: ${map.path}`
        : `Cannot use ".." to navigate to parent`;
      throw new Error(message);
    }
  }

  return undefined;
}
