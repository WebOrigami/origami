import MapKeysValuesGraph from "../core/MapKeysValuesGraph.js";

/**
 * Given a graph and a function, return a new explorable graph that applies the
 * function to the inner graph's values. If an inner extension is specified,
 * only apply the transformation to keys in the inner graph that end with that
 * extension. If an outer extension is specified, change the extension on the
 * exposed outer keys to that extension.
 */
export default class MapExtensionsGraph extends MapKeysValuesGraph {
  constructor(variant, mapFn, options = {}) {
    super(variant, mapFn, options);
    this.innerExtension = options.innerExtension?.toLowerCase() ?? "";
    this.outerExtension =
      options.outerExtension?.toLowerCase() ?? this.innerExtension;
  }

  async innerKeyForOuterKey(outerKey) {
    const basename = matchExtension(outerKey, this.outerExtension);
    return basename ? `${basename}${this.innerExtension}` : outerKey;
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    const base = await super.mapApplies(innerValue, outerKey, innerKey);
    return base && matchExtension(outerKey, this.outerExtension) !== null;
  }

  async outerKeyForInnerKey(innerKey) {
    const basename = matchExtension(innerKey, this.innerExtension);
    return basename ? `${basename}${this.outerExtension}` : innerKey;
  }
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
    if (key.length > extension.length && key.endsWith(extension)) {
      return key.substring(0, key.length - extension.length);
    }
  } else if (!key.includes?.(".")) {
    // Key matches if it has no extension
    return key;
  }
  // Didn't match
  return null;
}
