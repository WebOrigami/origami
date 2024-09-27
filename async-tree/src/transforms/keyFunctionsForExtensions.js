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
      const basename = matchExtension(baseKey, resultExtension);
      return basename ? `${basename}${dotPrefix(sourceExtension)}` : undefined;
    },

    async key(sourceKey, tree) {
      const hasSlash = trailingSlash.has(sourceKey);
      const baseKey = trailingSlash.remove(sourceKey);
      const basename = matchExtension(baseKey, sourceExtension);
      return basename
        ? // Preserve trailing slash
          trailingSlash.toggle(
            `${basename}${dotPrefix(resultExtension)}`,
            hasSlash
          )
        : undefined;
    },
  };
}

function dotPrefix(resultExtension) {
  return resultExtension ? `.${resultExtension}` : "";
}

/**
 * See if the key ends with the given resultExtension. If it does, return the
 * base name without the resultExtension; if it doesn't return null.
 *
 * A trailing slash in the key is ignored for purposes of comparison to comply
 * with the way Origami can unpack files. Example: the keys "data.json" and
 * "data.json/" are treated equally.
 *
 * This uses a different, more general interpretation of "resultExtension" to
 * mean any suffix, rather than Node's interpretation `path.extname`. In
 * particular, this will match an "resultExtension" like ".foo.bar" that
 * contains more than one dot.
 */
function matchExtension(key, resultExtension) {
  if (resultExtension) {
    // Key matches if it ends with the same resultExtension
    const dotExtension = dotPrefix(resultExtension);
    if (
      key.length > dotExtension.length &&
      key.toLowerCase().endsWith(dotExtension)
    ) {
      return key.substring(0, key.length - dotExtension.length);
    }
  } else if (!key.includes?.(".")) {
    // Key matches if it has no resultExtension
    return key;
  }
  // Didn't match
  return null;
}
