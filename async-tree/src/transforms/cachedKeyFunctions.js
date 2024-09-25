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
      const resultKeyWithoutSlash = trailingSlash.remove(resultKey);
      for (const sourceKey of await tree.keys()) {
        // Skip any source keys we already know about.
        if (sourceKeyToResultKey.has(sourceKey)) {
          continue;
        }

        const computedResultKey = await computeAndCacheResultKey(
          tree,
          keyFn,
          skipSubtrees,
          sourceKey
        );

        if (trailingSlash.remove(computedResultKey) === resultKeyWithoutSlash) {
          // Match found, match trailing slash and return
          return trailingSlash.toggle(sourceKey, trailingSlash.has(resultKey));
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

      const resultKey = await computeAndCacheResultKey(
        tree,
        keyFn,
        skipSubtrees,
        sourceKey
      );
      return resultKey;
    },
  };
}

async function computeAndCacheResultKey(tree, keyFn, skipSubtrees, sourceKey) {
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

// Search the given key map for the key. Ignore trailing slashes in the search,
// but preserve them in the result.
function searchKeyMap(keyMap, key) {
  // Check key as is
  let match;
  if (keyMap.has(key)) {
    match = keyMap.get(key);
  } else if (!trailingSlash.has(key)) {
    // Check key without trailing slash
    const withSlash = trailingSlash.add(key);
    if (keyMap.has(withSlash)) {
      match = keyMap.get(withSlash);
    }
  }
  return match
    ? trailingSlash.toggle(match, trailingSlash.has(key))
    : undefined;
}
