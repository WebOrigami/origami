import * as Tree from "../Tree.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @param {{ deep?: boolean, extension?: string, innerExtension: string, tree?: AsyncTree }} options
 */
export default function createExtensionKeyFns({
  deep,
  extension,
  innerExtension,
  tree,
}) {
  if (!extension) {
    extension = innerExtension;
  }

  const innerKeyFn = async function (outerKey) {
    const basename = matchExtension(outerKey, extension);
    return basename
      ? `${basename}${dotPrefix(innerExtension)}`
      : deep && tree && (await Tree.isKeyForSubtree(tree, outerKey))
      ? outerKey
      : undefined;
  };

  const keyFn = async function (innerKey) {
    const basename = matchExtension(innerKey, innerExtension);
    return basename
      ? `${basename}${dotPrefix(extension)}`
      : deep && tree && (await Tree.isKeyForSubtree(tree, innerKey))
      ? innerKey
      : undefined;
  };

  return { innerKeyFn, keyFn };
}

function dotPrefix(extension) {
  return extension ? `.${extension}` : "";
}

/**
 * See if the key ends with the given extension. If it does, return the base
 * name without the extension; if it doesn't return null.
 *
 * An empty/null extension means: match any key that does *not* contain a
 * period.
 *
 * This uses a different, more general interpretation of "extension" to mean any
 * suffix, rather than Node's interpretation `path.extname`. In particular, this
 * will match an "extension" like ".foo.bar" that contains more than one dot.
 */
function matchExtension(key, extension) {
  if (extension) {
    // Key matches if it ends with the same extension
    const dotExtension = dotPrefix(extension);
    if (
      key.length > dotExtension.length &&
      key.toLowerCase().endsWith(dotExtension)
    ) {
      return key.substring(0, key.length - dotExtension.length);
    }
  } else if (!key.includes?.(".")) {
    // Key matches if it has no extension
    return key;
  }
  // Didn't match
  return null;
}
