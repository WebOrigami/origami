import * as Tree from "../Tree.js";

const treeToCaches = new WeakMap();

/**
 * Given a keyMap, return a new keyMap and inverseKeyMap that cache the results of
 * the original keyMap.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 *
 * @param {KeyFn} keyMap
 * @param {boolean} [deep]
 * @returns {{ keyMap: KeyFn, inverseKeyMap: KeyFn }}
 */
export default function createCachedKeysTransform(keyMap, deep = false) {
  return {
    async inverseKeyMap(resultKey, tree) {
      const caches = getCachesForTree(tree);

      // First check to see if we've already computed an source key for this
      // result key. Again, we have to use `has()` for this check.
      if (caches.resultKeyToSourceKey.has(resultKey)) {
        return caches.resultKeyToSourceKey.get(resultKey);
      }

      // Iterate through the tree's keys, calculating source keys as we go,
      // until we find a match. Cache all the intermediate results and the
      // final match. This is O(n), but we stop as soon as we find a match,
      // and subsequent calls will benefit from the intermediate results.
      for (const sourceKey of await tree.keys()) {
        // Skip any source keys we already know about.
        if (caches.sourceKeyToResultKey.has(sourceKey)) {
          continue;
        }

        let computedResultKey;
        if (deep && (await Tree.isKeyForSubtree(tree, sourceKey))) {
          computedResultKey = sourceKey;
        } else {
          computedResultKey = await keyMap(sourceKey, tree);
        }

        caches.sourceKeyToResultKey.set(sourceKey, computedResultKey);
        caches.resultKeyToSourceKey.set(computedResultKey, sourceKey);

        if (computedResultKey === resultKey) {
          // Match found.
          return sourceKey;
        }
      }

      return undefined;
    },

    async keyMap(sourceKey, tree) {
      const keyMaps = getCachesForTree(tree);

      // First check to see if we've already computed an result key for this
      // source key. The cached result key may be undefined, so we have to use
      // `has()` instead of calling `get()` and checking for undefined.
      if (keyMaps.sourceKeyToResultKey.has(sourceKey)) {
        return keyMaps.sourceKeyToResultKey.get(sourceKey);
      }

      const resultKey = await keyMap(sourceKey, tree);

      // Cache the mappings from source key <-> result key for next time.
      keyMaps.sourceKeyToResultKey.set(sourceKey, resultKey);
      keyMaps.resultKeyToSourceKey.set(resultKey, sourceKey);

      return resultKey;
    },
  };
}

function getCachesForTree(tree) {
  let keyMaps = treeToCaches.get(tree);
  if (!keyMaps) {
    keyMaps = {
      resultKeyToSourceKey: new Map(),
      sourceKeyToResultKey: new Map(),
    };
    treeToCaches.set(tree, keyMaps);
  }
  return keyMaps;
}
