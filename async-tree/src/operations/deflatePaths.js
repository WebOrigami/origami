import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import deepPathsIterator from "./deepPathsIterator.js";
import traversePath from "./traversePath.js";

/**
 * Given a tree, return a flat mapping of string paths to values.
 *
 * If a `basePath` is provided, it will be prepended to all paths in the result.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {{ assumeSlashKeys?: boolean, base?: string }} options
 */
export default async function deflatePaths(maplike, options = {}) {
  const tree = await args.map(maplike, "Tree.deflatePaths", { deep: true });

  return Object.assign(new AsyncMap(), {
    async get(path) {
      return traversePath(tree, path);
    },

    async *keys() {
      yield* deepPathsIterator(tree, options);
    },
  });
}
