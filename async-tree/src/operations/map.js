import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
import toFunction from "../utilities/toFunction.js";
import cachedKeyFunctions from "./cachedKeyFunctions.js";
import extensionKeyFunctions from "./extensionKeyFunctions.js";
import isAsyncTree from "./isAsyncTree.js";
import keys from "./keys.js";
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
 * @returns {Promise<AsyncTree>}
 */
export default async function map(treelike, options = {}) {
  if (isUnpackable(options)) {
    options = await options.unpack();
  }
  const validated = validateOptions(options);
  const mapFn = createMapFn(validated);

  const tree = await getTreeArgument(treelike, "map", { deep: validated.deep });
  return mapFn(tree);
}

// Create a get() function for the map
function createGet(tree, options, mapFn) {
  const { inverseKeyFn, deep, valueFn } = options;
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
        const resultValue = isAsyncTree(sourceValue)
          ? mapFn(sourceValue)
          : undefined;
        return resultValue;
      } else {
        // No inverseKeyFn, or it returned undefined; use resultKey
        sourceKey = resultKey;
      }
    }

    // Step 2: Get the source value
    let sourceValue = await tree.get(sourceKey);
    if (deep && sourceValue === undefined) {
      // Key might be for a subtree, see if original key exists
      sourceValue = await tree.get(resultKey);
    }

    // Step 3: Map the source value to the result value
    let resultValue;
    if (sourceValue === undefined) {
      // No source value means no result value
      resultValue = undefined;
    } else if (deep && isAsyncTree(sourceValue)) {
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
  const { deep, keyFn, keyNeedsSourceValue } = options;
  return async function* () {
    // Apply the keyFn to source keys for leaf values (not subtrees).
    const sourceKeys = await keys(tree);
    if (!keyFn) {
      // Return keys as is
      yield* sourceKeys;
      return;
    }
    const sourceValues = keyNeedsSourceValue
      ? await Promise.all(sourceKeys.map((sourceKey) => tree.get(sourceKey)))
      : sourceKeys.map(() => null);
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
    yield* resultKeys;
  };
}

// Create a map function for the given options
function createMapFn(options) {
  /**
   * @param {AsyncTree} tree
   * @return {AsyncTree}
   */
  return function mapFn(tree) {
    const transformed = Object.create(new AsyncMap());
    transformed.description = options.description;
    transformed.source = tree;
    transformed.get = createGet(tree, options, mapFn);
    transformed.keys = createKeys(tree, options);
    return transformed;
  };
}

// Return the indicated option, throwing if it's specified but not defined;
// that's probably an accident.
function validateOption(options, key) {
  const value = options[key];
  if (key in options && value === undefined) {
    throw new TypeError(
      `map: The ${key} option is given but its value is undefined.`
    );
  }
  return value;
}

// Extract and validate options
function validateOptions(options) {
  let deep;
  let description;
  let extension;
  let inverseKeyFn;
  let keyFn;
  let keyNeedsSourceValue;
  let valueFn;

  if (typeof options === "function") {
    // Take the single function argument as the valueFn
    valueFn = options;
  } else if (isPlainObject(options)) {
    // Extract options from the dictionary
    description = options.description; // fine if it's undefined

    // Validate individual options
    deep = validateOption(options, "deep");
    extension = validateOption(options, "extension");
    inverseKeyFn = validateOption(options, "inverseKey");
    keyFn = validateOption(options, "key");
    keyNeedsSourceValue = validateOption(options, "keyNeedsSourceValue");
    valueFn = validateOption(options, "value");

    // Cast function options to functions
    inverseKeyFn &&= toFunction(inverseKeyFn);
    keyFn &&= toFunction(keyFn);
    valueFn &&= toFunction(valueFn);
  } else if (options === undefined) {
    /** @type {any} */
    const error = new TypeError(`map: The second parameter was undefined.`);
    error.position = 1;
    throw error;
  } else {
    /** @type {any} */
    const error = new TypeError(
      `map: You must specify a value function or options dictionary as the second parameter.`
    );
    error.position = 1;
    throw error;
  }

  if (extension && !options._noExtensionWarning) {
    console.warn(
      `map: The 'extension' option for Tree.map() is deprecated and will be removed in a future release. Use Tree.mapExtension() instead.`
    );
  }
  if (extension && (keyFn || inverseKeyFn)) {
    throw new TypeError(
      `map: You can't specify extensions and also a key or inverseKey function`
    );
  }
  if (extension && keyNeedsSourceValue === true) {
    throw new TypeError(
      `map: using extensions sets keyNeedsSourceValue to be false`
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
    keyNeedsSourceValue = false;
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

  // Set defaults for options not specified. We don't set a default value for
  // `deep` because a false value is a stronger signal than undefined.
  description ??= "key/value map";
  keyNeedsSourceValue ??= true;

  return {
    deep,
    description,
    inverseKeyFn,
    keyFn,
    keyNeedsSourceValue,
    valueFn,
  };
}
