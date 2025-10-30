import keysFromPath from "../utilities/keysFromPath.js";
import traverse from "./traverse.js";

/**
 * Given a slash-separated path like "foo/bar", traverse the keys "foo/" and
 * "bar" and return the resulting value.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} tree
 * @param {string} path
 */
export default async function traversePath(tree, path) {
  const keys = keysFromPath(path);
  return traverse(tree, ...keys);
}
