import { keysFromPath } from "../utilities.js";
import traverse from "./traverse.js";

/**
 * Given a slash-separated path like "foo/bar", traverse the keys "foo/" and
 * "bar" and return the resulting value.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} tree
 * @param {string} path
 */
export default async function traversePath(tree, path) {
  const keys = keysFromPath(path);
  return traverse(tree, ...keys);
}
