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
      const basename = matchExtension(resultKey, resultExtension);
      return basename ? `${basename}${dotPrefix(sourceExtension)}` : undefined;
    },

    async key(sourceKey, tree) {
      const basename = matchExtension(sourceKey, sourceExtension);
      return basename ? `${basename}${dotPrefix(resultExtension)}` : undefined;
    },
  };
}

function dotPrefix(resultExtension) {
  return resultExtension ? `.${resultExtension}` : "";
}

/**
 * See if the key ends with the given resultExtension. If it does, return the base
 * name without the resultExtension; if it doesn't return null.
 *
 * An empty/null resultExtension means: match any key that does *not* contain a
 * period.
 *
 * This uses a different, more general interpretation of "resultExtension" to mean any
 * suffix, rather than Node's interpretation `path.extname`. In particular, this
 * will match an "resultExtension" like ".foo.bar" that contains more than one dot.
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
