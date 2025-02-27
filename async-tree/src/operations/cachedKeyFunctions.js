import * as trailingSlash from "../trailingSlash.js";

const treeToCaches = new Map();

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

        if (
          computedResultKey &&
          trailingSlash.remove(computedResultKey) === resultKeyWithoutSlash
        ) {
          // Match found
          return matchSlashHandling(computedResultKey, sourceKey, resultKey);
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

// Given the input key passed to a function and the result of that function, and
// a requested key being searched for, determine whether we should add a slash
// to the output key.
function matchSlashHandling(inputKey, outputKey, requestedKey) {
  if (trailingSlash.has(inputKey) !== trailingSlash.has(outputKey)) {
    // The key function toggled the slash on the input key; return output as is
    return outputKey;
  } else {
    // Match the slash handling of the requested key
    return trailingSlash.toggle(outputKey, trailingSlash.has(requestedKey));
  }
}

// Search the given key map for the key. Ignore trailing slashes in the search.
function searchKeyMap(keyMap, requestedKey) {
  // Check key as is
  let resultKey;
  let sourceKey = requestedKey;
  if (keyMap.has(sourceKey)) {
    resultKey = keyMap.get(requestedKey);
  } else {
    // Check alternative with/without slash
    sourceKey = trailingSlash.toggle(requestedKey);
    resultKey = keyMap.get(sourceKey);
  }
  if (resultKey === undefined) {
    return undefined;
  }
  return matchSlashHandling(sourceKey, resultKey, requestedKey);
}
