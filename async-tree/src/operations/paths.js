import * as args from "../utilities/args.js";
import deepPathsIterator from "./deepPathsIterator.js";

/**
 * Returns slash-separated paths for all values in the tree.
 *
 * The `base` argument is prepended to all paths.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {{ assumeSlashKeys?: boolean, base?: string }} options
 */
export default async function paths(maplike, options = {}) {
  const tree = await args.map(maplike, "Tree.paths");
  const result = [];
  for await (const path of deepPathsIterator(tree, options)) {
    result.push(path);
  }
  return result;
}
