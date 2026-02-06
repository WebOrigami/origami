import * as args from "../utilities/args.js";
import keysFromPath from "../utilities/keysFromPath.js";
import traverse from "./traverse.js";

/**
 * Given a slash-separated path like "foo/bar", traverse the keys "foo/" and
 * "bar" and return the resulting value.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {string} path
 */
export default async function traversePath(maplike, path) {
  const map = await args.map(maplike, "Tree.traversePath");
  const keys = keysFromPath(path);
  return traverse(map, ...keys);
}
