import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";
import { assertIsTreelike } from "../utilities.js";
import cachedKeyFunctions from "./cachedKeyFunctions.js";
import extensionKeyFunctions from "./extensionKeyFunctions.js";
import parseExtensions from "./parseExtensions.js";

/**
 * Transform the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").TreeMapOptions} MapOptions
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {MapOptions|ValueKeyFn} options
 * @returns {AsyncTree}
 */
export default function map(treelike, options = {}) {
  assertIsTreelike(treelike, "map");
  const validated = validateOptions(options);
  const mapFn = createMapFn(validated);
  const tree = Tree.from(treelike, { deep: validated.deep });
  return mapFn(tree);
}

// Create a get() function for the map
function createGet(tree, options, mapFn) {
  const { inverseKeyFn, deep, needsSourceValue, valueFn } = options;
  return async (resultKey) => {
    if (resultKey === undefined) {
      throw new ReferenceError(`map: Cannot get an undefined key.`);
    }

    // Step 1: Map the result key to the source key
    let sourceKey = await inverseKeyFn?.(resultKey, tree);

    if (sourceKey === undefined) {
      if (deep && trailingSlash.has(resultKey)) {
        // Special case: deep tree and value is expected to be a subtree
        const sourceValue = await tree.get(resultKey);
        // If we did get a subtree, apply the map to it
        const resultValue = Tree.isAsyncTree(sourceValue)
          ? mapFn(sourceValue)
          : undefined;
        return resultValue;
      } else {
        // No inverseKeyFn, or it returned undefined; use resultKey
        sourceKey = resultKey;
      }
    }

    // Step 2: Get the source value
    let sourceValue;
    if (needsSourceValue) {
      // Normal case: get the value from the source tree
      sourceValue = await tree.get(sourceKey);
      if (deep && sourceValue === undefined) {
        // Key might be for a subtree, see if original key exists
        sourceValue = await tree.get(resultKey);
      }
    }

    // Step 3: Map the source value to the result value
    let resultValue;
    if (needsSourceValue && sourceValue === undefined) {
      // No source value means no result value
      resultValue = undefined;
    } else if (deep && Tree.isAsyncTree(sourceValue)) {
      // We weren't expecting a subtree but got one; map it
      resultValue = mapFn(sourceValue);
    } else if (valueFn) {
      // Map a single value
      resultValue = await valueFn(sourceValue, sourceKey, tree);
    } else {
      // Return source value as is
      resultValue = sourceValue;
    }

    return resultValue;
  };
}

// Create a keys() function for the map
function createKeys(tree, options) {
  const { deep, keyFn } = options;
  return async () => {
    // Apply the keyFn to source keys for leaf values (not subtrees).
    const sourceKeys = Array.from(await tree.keys());
    const sourceValues = await Promise.all(
      sourceKeys.map((sourceKey) => tree.get(sourceKey))
    );
    const mapped = await Promise.all(
      sourceKeys.map(async (sourceKey, index) =>
        // Deep maps leave source keys for subtrees alone
        deep && trailingSlash.has(sourceKey)
          ? sourceKey
          : await keyFn(sourceValues[index], sourceKey, tree)
      )
    );
    // Filter out any cases where the keyFn returned undefined.
    const resultKeys = mapped.filter((key) => key !== undefined);
    return resultKeys;
  };
}

// Create a map function for the given options
function createMapFn(options) {
  const { description, keyFn, valueFn } = options;
  /**
   * @param {AsyncTree} tree
   * @return {AsyncTree}
   */
  return function mapFn(tree) {
    // The transformed tree is actually an extension of the original tree's
    // prototype chain. This allows the transformed tree to inherit any
    // properties/methods. For example, the `parent` of the transformed tree is
    // the original tree's parent.
    const transformed = Object.create(tree);
    transformed.description = description;
    if (keyFn || valueFn) {
      transformed.get = createGet(tree, options, mapFn);
    }
    if (keyFn) {
      transformed.keys = createKeys(tree, options);
    }
    return transformed;
  };
}

// Extract and validate options
function validateOptions(options) {
  let deep;
  let description;
  let extension;
  let inverseKeyFn;
  let keyFn;
  let needsSourceValue;
  let valueFn;

  if (typeof options === "function") {
    // Take the single function argument as the valueFn
    valueFn = options;
  } else {
    deep = options.deep;
    description = options.description;
    extension = options.extension;
    inverseKeyFn = options.inverseKey;
    keyFn = options.key;
    needsSourceValue = options.needsSourceValue;
    valueFn = options.value;
  }

  if (extension && (keyFn || inverseKeyFn)) {
    throw new TypeError(
      `map: You can't specify extensions and also a key or inverseKey function`
    );
  }

  if (extension) {
    // Use the extension mapping to generate key and inverseKey functions
    const parsed = parseExtensions(extension);
    const keyFns = extensionKeyFunctions(
      parsed.sourceExtension,
      parsed.resultExtension
    );
    keyFn = keyFns.key;
    inverseKeyFn = keyFns.inverseKey;
  } else {
    // If key or inverseKey weren't specified, look for sidecar functions
    inverseKeyFn ??= valueFn?.inverseKey;
    keyFn ??= valueFn?.key;

    if (!keyFn && inverseKeyFn) {
      throw new TypeError(
        `map: You can't specify an inverseKey function without a key function`
      );
    }

    if (keyFn && !inverseKeyFn) {
      // Only keyFn was provided, so we need to generate the inverseKeyFn
      const keyFns = cachedKeyFunctions(keyFn, deep);
      keyFn = keyFns.key;
      inverseKeyFn = keyFns.inverseKey;
    }
  }

  if (!valueFn && !keyFn) {
    throw new TypeError(
      `map: You must specify a value function or a key function`
    );
  }

  deep ??= false;
  description ??= "key/value map";
  needsSourceValue ??= true;

  return {
    deep,
    description,
    inverseKeyFn,
    keyFn,
    needsSourceValue,
    valueFn,
  };
}
