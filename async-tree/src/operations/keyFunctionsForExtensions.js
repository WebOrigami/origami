import * as extension from "../extension.js";
import * as trailingSlash from "../trailingSlash.js";

/**
 * Given a source resultExtension and a result resultExtension, return a pair of key
 * functions that map between them.
 *
 * The resulting `inverseKey` and `key` functions are compatible with those
 * expected by map and other transforms.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @param {{ resultExtension?: string, sourceExtension: string }}
 * options
 */
export default function keyFunctionsForExtensions({
  resultExtension,
  sourceExtension,
}) {
  if (resultExtension === undefined) {
    resultExtension = sourceExtension;
  }

  return {
    async inverseKey(resultKey, tree) {
      // Remove trailing slash so that mapFn won't inadvertently unpack files.
      const baseKey = trailingSlash.remove(resultKey);
      const basename = extension.match(baseKey, resultExtension);
      return basename ? `${basename}${sourceExtension}` : undefined;
    },

    async key(sourceKey, tree) {
      return extension.match(sourceKey, sourceExtension)
        ? extension.replace(sourceKey, sourceExtension, resultExtension)
        : undefined;
    },
  };
}
