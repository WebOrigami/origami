import * as trailingSlash from "../trailingSlash.js";

const treeToCaches = new WeakMap();

/**
 * Given a key function, return a new key function and inverse key function that
 * cache the results of the original.
 *
 * If `skipSubtrees` is true, the inverse key function will skip any source keys
 * that are keys for subtrees, returning the source key unmodified.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 *
 * @param {KeyFn} keyFn
 * @param {boolean?} skipSubtrees
 * @returns {{ key: KeyFn, inverseKey: KeyFn }}
 */
export default function cachedKeyFunctions(keyFn, skipSubtrees = false) {
  return {
    async inverseKey(resultKey, tree) {
      const { resultKeyToSourceKey, sourceKeyToResultKey } =
        getKeyMapsForTree(tree);

      const cachedSourceKey = searchKeyMap(resultKeyToSourceKey, resultKey);
      if (cachedSourceKey !== undefined) {
        return cachedSourceKey;
      }

      // Iterate through the tree's keys, calculating source keys as we go,
      // until we find a match. Cache all the intermediate results and the
      // final match. This is O(n), but we stop as soon as we find a match,
      // and subsequent calls will benefit from the intermediate results.
      for (const sourceKey of await tree.keys()) {
        // Skip any source keys we already know about.
        if (sourceKeyToResultKey.has(sourceKey)) {
          continue;
        }

        let computedResultKey = await computeResultKey(
          tree,
          keyFn,
          skipSubtrees,
          sourceKey
        );
        if (computedResultKey === resultKey) {
          // Match found.
          return sourceKey;
        }
      }

      return undefined;
    },

    async key(sourceKey, tree) {
      const { sourceKeyToResultKey } = getKeyMapsForTree(tree);

      const cachedResultKey = searchKeyMap(sourceKeyToResultKey, sourceKey);
      if (cachedResultKey !== undefined) {
        return cachedResultKey;
      }

      let resultKey = await computeResultKey(
        tree,
        keyFn,
        skipSubtrees,
        sourceKey
      );
      return resultKey;
    },
  };
}

async function computeResultKey(tree, keyFn, skipSubtrees, sourceKey) {
  const { resultKeyToSourceKey, sourceKeyToResultKey } =
    getKeyMapsForTree(tree);

  const resultKey =
    skipSubtrees && trailingSlash.has(sourceKey)
      ? sourceKey
      : await keyFn(sourceKey, tree);

  sourceKeyToResultKey.set(sourceKey, resultKey);
  resultKeyToSourceKey.set(resultKey, sourceKey);

  return resultKey;
}

// Maintain key->inverseKey and inverseKey->key mappings for each tree. These
// store subtree keys in either direction with a trailing slash.
function getKeyMapsForTree(tree) {
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

function searchKeyMap(keyMap, key) {
  // Check key as is
  if (keyMap.has(key)) {
    return keyMap.get(key);
  }
  if (!trailingSlash.has(key)) {
    // Check key without trailing slash
    const withSlash = trailingSlash.add(key);
    if (keyMap.has(withSlash)) {
      return keyMap.get(withSlash);
    }
  }
  return undefined;
}
