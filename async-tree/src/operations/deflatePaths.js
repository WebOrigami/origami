import { AsyncMap } from "../internal.js";
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
 * @param {{ assumeSlashKeys?: boolean, base?: string }} [options]
 */
export default function deflatePaths(maplike, options = {}) {
  const tree = args.map(maplike, "Tree.deflatePaths", { deep: true });
  const { assumeSlashKeys, base } = args.dictionary(
    options,
    "Tree.deflatePaths",
    {
      assumeSlashKeys: { required: false, type: "boolean" },
      base: { required: false, type: "string" },
    },
  );

  return Object.assign(new AsyncMap(), {
    async get(path) {
      // Subtract the base path from the beginning of the path if it exists
      if (base && path.startsWith(base)) {
        path = path.slice(base.length);
      }
      const value = await traversePath(tree, path);
      return value;
    },

    async *keys() {
      yield* deepPathsIterator(tree, { assumeSlashKeys, base });
    },
  });
}
