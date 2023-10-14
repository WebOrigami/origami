import { Graph } from "@graphorigami/core";
import MapKeysValuesGraph from "./MapKeysValuesGraph.js";

/**
 * Given a graph and a function, return a new graph that applies the function to
 * the inner graph's values. If an inner extension is specified, only apply the
 * transformation to keys in the inner graph that end with that extension. If an
 * outer extension is specified, change the extension on the exposed outer keys
 * to that extension.
 */
export default class MapExtensionsGraph extends MapKeysValuesGraph {
  constructor(graphable, mapFn, options = {}) {
    super(graphable, mapFn, options);
    const { innerExtension, outerExtension } = parseExtension(
      options.extension
    );
    this.innerExtension = innerExtension;
    this.outerExtension = outerExtension;
    this.extensionMatchesOnly = options.extensionMatchesOnly ?? false;
  }

  async innerKeyForOuterKey(outerKey) {
    const basename = matchExtension(outerKey, this.outerExtension);
    return basename
      ? `${basename}${dotPrefix(this.innerExtension)}`
      : !this.extensionMatchesOnly ||
        (await Graph.isKeyForSubtree(this.graph, outerKey))
      ? outerKey
      : undefined;
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    const base = await super.mapApplies(innerValue, outerKey, innerKey);
    return base && matchExtension(outerKey, this.outerExtension) !== null;
  }

  async outerKeyForInnerKey(innerKey) {
    const basename = matchExtension(innerKey, this.innerExtension);
    return basename
      ? `${basename}${dotPrefix(this.outerExtension)}`
      : !this.extensionMatchesOnly ||
        (this.deep && (await Graph.isKeyForSubtree(this.graph, innerKey)))
      ? innerKey
      : undefined;
  }
}

function dotPrefix(extension) {
  return extension ? `.${extension}` : "";
}

// See if the key ends with the given extension. If it does, return the basename
// without the extension; if it doesn't return null.
//
// An empty/null extension means: match any key that does *not* contain a period.
//
// We use a cruder but more general interpretation of "extension" to mean any
// suffix, rather than Node's `path` interpretation in extname. In particular,
// we want to be able to match an "extension" like ".foo.bar" that contains more
// than one dot.
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

function parseExtension(specifier) {
  const lowercase = specifier?.toLowerCase() ?? "";
  // Syntax:
  // foo
  // foo→bar
  // foo->bar
  const extensionRegex = /^\.?(?<inner>\S*)(?:\s*(→|->)\s*)\.?(?<outer>\S+)$/;
  let innerExtension;
  let outerExtension;
  const match = lowercase.match(extensionRegex);
  if (match) {
    innerExtension = match.groups.inner;
    outerExtension = match.groups.outer;
  } else {
    innerExtension = lowercase;
    outerExtension = lowercase;
  }
  return { innerExtension, outerExtension };
}
