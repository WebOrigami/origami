import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import cachedKeyFunctions from "./cachedKeyFunctions.js";
import isMap from "./isMap.js";
import keys from "./keys.js";

/**
 * Transform the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").MapOptions} MapOptions
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {MapOptions|ValueKeyFn} options
 * @returns {AsyncMap}
 */
export default function map(maplike, options = {}) {
  const validated = validateOptions(options);
  const mapFn = createMapFn(validated);
  const tree = args.map(maplike, "Tree.map", {
    deep: validated.deep,
  });
  return mapFn(tree);
}

// Create a get() function for the map
function createGet(tree, options, mapFn) {
  const { inverseKey, deep, value } = options;
  return async (resultKey) => {
    if (resultKey === undefined) {
      throw new ReferenceError(`Tree.map: Cannot get an undefined key.`);
    }

    // Step 1: Map the result key to the source key
    let sourceKey = await inverseKey?.(resultKey, tree);

    if (sourceKey === undefined) {
      if (deep && trailingSlash.has(resultKey)) {
        // Special case: deep tree and value is expected to be a subtree
        const sourceValue = await tree.get(resultKey);
        // If we did get a subtree, apply the map to it
        const resultValue = isMap(sourceValue) ? mapFn(sourceValue) : undefined;
        return resultValue;
      } else {
        // No inverseKey, or it returned undefined; use resultKey
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
    } else if (deep && isMap(sourceValue)) {
      // We weren't expecting a subtree but got one; map it
      resultValue = mapFn(sourceValue);
    } else if (value) {
      // Map a single value
      resultValue = await value(sourceValue, sourceKey, tree);
    } else {
      // Return source value as is
      resultValue = sourceValue;
    }

    return resultValue;
  };
}

// Create a keys() function for the map
function createKeys(tree, options) {
  const { deep, key, keyNeedsSourceValue } = options;
  return async function* () {
    // Apply the key to source keys for leaf values (not subtrees).
    const sourceKeys = await keys(tree);
    if (!key) {
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
          : await key(sourceValues[index], sourceKey, tree),
      ),
    );
    // Filter out any cases where the key returned undefined.
    const resultKeys = mapped.filter((resultKey) => resultKey !== undefined);
    yield* resultKeys;
  };
}

// Create a map function for the given options
function createMapFn(options) {
  /**
   * @param {Map|AsyncMap} tree
   * @return {AsyncMap}
   */
  return function mapFn(tree) {
    /** @type {any} */
    const transformed = new AsyncMap();
    transformed.description = options.description;
    transformed.source = tree;
    transformed.get = createGet(tree, options, mapFn);
    transformed.keys = createKeys(tree, options);
    transformed.trailingSlashKeys = /** @type {any} */ (tree).trailingSlashKeys;
    return transformed;
  };
}

// Extract and validate options
function validateOptions(options) {
  let { deep, description, inverseKey, key, keyNeedsSourceValue, value } =
    args.dictionaryOrFn(
      options,
      "Tree.map",
      "value",
      {
        deep: { type: "boolean", required: false },
        description: { type: "string", required: false },
        inverseKey: { type: "fn", required: false },
        key: { type: "fn", required: false },
        keyNeedsSourceValue: { type: "boolean", required: false },
        value: { type: "fn", required: false },
      },
      { position: 2 },
    );

  if (typeof key === "string" && (key.includes("=>") || key.includes("→"))) {
    throw new TypeError(
      `Tree.map: The key option appears to be an extension mapping. Did you mean to call Tree.mapExtension() ?`,
    );
  }

  // If key or inverseKey weren't specified, look for sidecar functions
  inverseKey ??= value?.inverseKey;
  key ??= value?.key;

  if (!key && inverseKey) {
    throw new TypeError(
      `Tree.map: You can't specify an inverseKey function without a key function`,
    );
  }

  if (key && !inverseKey) {
    // Only key was provided, so we need to generate the inverseKey
    const keys = cachedKeyFunctions(key, deep);
    key = keys.key;
    inverseKey = keys.inverseKey;
  }

  if (!value && !key) {
    throw new TypeError(
      `Tree.map: You must specify a value function or a key function`,
    );
  }

  // Set defaults for options not specified. We don't set a default value for
  // `deep` because a false value is a stronger signal than undefined.
  description ??= "key/value map";
  keyNeedsSourceValue ??= key?.needsSourceValue ?? true;

  return {
    deep,
    description,
    inverseKey,
    key,
    keyNeedsSourceValue,
    value,
  };
}
