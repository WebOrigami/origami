import * as Tree from "../Tree.js";
import mapTransform from "./mapTransform.js";

/**
 * Return a map transform that caches the transform's inner and outer keys.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {{ deep?: boolean, description?: string, keyFn?: KeyFn, valueFn?: ValueKeyFn }} options
 * @returns
 */
export default function createCachedKeysTransform({
  deep = false,
  description = "cached keys transform",
  keyFn,
  valueFn,
}) {
  return function (tree) {
    let cachedKeyFn;
    let cachedInnerKeyFn;
    if (keyFn) {
      const innerKeyToOuterKey = new Map();
      const outerKeyToInnerKey = new Map();

      cachedKeyFn = async function (innerKey, tree) {
        // First check to see if we've already computed an outer key for this
        // inner key. The cached outer key may be undefined, so we have to use
        // `has()` instead of calling `get()` and checking for undefined.
        if (innerKeyToOuterKey.has(innerKey)) {
          return innerKeyToOuterKey.get(innerKey);
        }

        const outerKey = await keyFn(innerKey, tree);

        // Cache the mappings from inner key <-> outer key for next time.
        innerKeyToOuterKey.set(innerKey, outerKey);
        outerKeyToInnerKey.set(outerKey, innerKey);

        return outerKey;
      };

      cachedInnerKeyFn = async function (outerKey, tree) {
        // First check to see if we've already computed an inner key for this
        // outer key. Again, we have to use `has()` for this check.
        if (outerKeyToInnerKey.has(outerKey)) {
          return outerKeyToInnerKey.get(outerKey);
        }

        // Iterate through the tree's keys, calculating inner keys as we go,
        // until we find a match. Cache all the intermediate results and the
        // final match. This is O(n), but we stop as soon as we find a match,
        // and subsequent calls will benefit from the intermediate results.
        for (const innerKey of await tree.keys()) {
          // Skip any inner keys we already know about.
          if (innerKeyToOuterKey.has(innerKey)) {
            continue;
          }

          const innerValue = await tree.get(innerKey);

          let computedOuterKey;
          if (deep && Tree.isAsyncTree(innerValue)) {
            computedOuterKey = innerKey;
          } else {
            computedOuterKey = await keyFn(innerKey, tree);
          }

          innerKeyToOuterKey.set(innerKey, computedOuterKey);
          outerKeyToInnerKey.set(computedOuterKey, innerKey);

          if (computedOuterKey === outerKey) {
            // Match found.
            return innerKey;
          }
        }

        return undefined;
      };
    }

    return mapTransform({
      deep,
      description,
      innerKeyFn: cachedInnerKeyFn,
      keyFn: cachedKeyFn,
      valueFn,
    })(tree);
  };
}
