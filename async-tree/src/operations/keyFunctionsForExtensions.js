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
      return basename
        ? `${basename}${extension.dotPrefix(sourceExtension)}`
        : undefined;
    },

    async key(sourceKey, tree) {
      const hasSlash = trailingSlash.has(sourceKey);
      const baseKey = trailingSlash.remove(sourceKey);
      const basename = extension.match(baseKey, sourceExtension);
      return basename
        ? // Preserve trailing slash
          trailingSlash.toggle(
            `${basename}${extension.dotPrefix(resultExtension)}`,
            hasSlash
          )
        : undefined;
    },
  };
}
