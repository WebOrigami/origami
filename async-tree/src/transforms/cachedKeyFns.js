import * as Tree from "../Tree.js";

const treeToKeyMaps = new WeakMap();

/**
 * Given a keyFn, return a new keyFn and innerKeyFn that cache the results of
 * the original keyFn.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 *
 * @param {KeyFn} keyFn
 * @param {boolean} [deep]
 * @returns {{ keyFn: KeyFn, innerKeyFn: KeyFn }}
 */
export default function createCachedKeysTransform(keyFn, deep = false) {
  return {
    async innerKeyFn(outerKey, tree) {
      const keyMaps = getKeyMapsForTree(tree);

      // First check to see if we've already computed an inner key for this
      // outer key. Again, we have to use `has()` for this check.
      if (keyMaps.outerKeyToInnerKey.has(outerKey)) {
        return keyMaps.outerKeyToInnerKey.get(outerKey);
      }

      // Iterate through the tree's keys, calculating inner keys as we go,
      // until we find a match. Cache all the intermediate results and the
      // final match. This is O(n), but we stop as soon as we find a match,
      // and subsequent calls will benefit from the intermediate results.
      for (const innerKey of await tree.keys()) {
        // Skip any inner keys we already know about.
        if (keyMaps.innerKeyToOuterKey.has(innerKey)) {
          continue;
        }

        let computedOuterKey;
        if (deep && (await Tree.isKeyForSubtree(tree, innerKey))) {
          computedOuterKey = innerKey;
        } else {
          computedOuterKey = await keyFn(innerKey, tree);
        }

        keyMaps.innerKeyToOuterKey.set(innerKey, computedOuterKey);
        keyMaps.outerKeyToInnerKey.set(computedOuterKey, innerKey);

        if (computedOuterKey === outerKey) {
          // Match found.
          return innerKey;
        }
      }

      return undefined;
    },

    async keyFn(innerKey, tree) {
      const keyMaps = getKeyMapsForTree(tree);

      // First check to see if we've already computed an outer key for this
      // inner key. The cached outer key may be undefined, so we have to use
      // `has()` instead of calling `get()` and checking for undefined.
      if (keyMaps.innerKeyToOuterKey.has(innerKey)) {
        return keyMaps.innerKeyToOuterKey.get(innerKey);
      }

      const outerKey = await keyFn(innerKey, tree);

      // Cache the mappings from inner key <-> outer key for next time.
      keyMaps.innerKeyToOuterKey.set(innerKey, outerKey);
      keyMaps.outerKeyToInnerKey.set(outerKey, innerKey);

      return outerKey;
    },
  };
}

function getKeyMapsForTree(tree) {
  let keyMaps = treeToKeyMaps.get(tree);
  if (!keyMaps) {
    keyMaps = {
      outerKeyToInnerKey: new Map(),
      innerKeyToOuterKey: new Map(),
    };
    treeToKeyMaps.set(tree, keyMaps);
  }
  return keyMaps;
}
