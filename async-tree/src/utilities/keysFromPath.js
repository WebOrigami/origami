import * as trailingSlash from "../trailingSlash.js";

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo/",
 * "bar/", "baz"].
 *
 * Leading slashes are ignored. Consecutive slashes will be ignored. Trailing
 * slashes are preserved.
 *
 * @param {string} pathname
 */
export default function keysFromPath(pathname) {
  // Split the path at each slash
  let keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  if (keys.at(-1) === "") {
    // The path ends with a slash; drop that part.
    keys.pop();
  }
  // Drop any empty keys
  keys = keys.filter((key) => key !== "");
  // Add the trailing slash back to all keys but the last
  for (let i = 0; i < keys.length - 1; i++) {
    keys[i] += "/";
  }
  // Add trailing slash to last key if path ended with a slash
  if (keys.length > 0 && trailingSlash.has(pathname)) {
    keys[keys.length - 1] += "/";
  }
  return keys;
}
