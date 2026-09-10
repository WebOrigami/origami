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
  const tree = await args.map(maplike, "Tree.paths", { deep: true });
  const { assumeSlashKeys, base } = await args.options(options, "Tree.paths", {
    assumeSlashKeys: { required: false, type: "boolean" },
    base: { required: false, type: "string" },
  });

  const result = [];
  for await (const path of deepPathsIterator(tree, { assumeSlashKeys, base })) {
    result.push(path);
  }
  return result;
}
