import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";
import { assertIsTreelike } from "../utilities.js";
import extensionKeyFunctions from "./extensionKeyFunctions.js";
import parseExtensions from "./parseExtensions.js";

/**
 * Transform the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").TreeMapOptions} MapOptions
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {MapOptions|ValueKeyFn} options
 */
export default function map(treelike, options = {}) {
  assertIsTreelike(treelike, "map");
  const { deep, description, inverseKeyFn, keyFn, needsSourceValue, valueFn } =
    validateOptions(options);

  /**
   * @param {import("@weborigami/types").AsyncTree} tree
   */
  function mapFn(tree) {
    // The transformed tree is actually an extension of the original tree's
    // prototype chain. This allows the transformed tree to inherit any
    // properties/methods. For example, the `parent` of the transformed tree is
    // the original tree's parent.
    const transformed = Object.create(tree);

    transformed.description = description;

    if (keyFn || valueFn) {
      transformed.get = async (resultKey) => {
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

        // Regular path: map a single value

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

    if (keyFn) {
      transformed.keys = async () => {
        // Apply the keyFn to source keys for leaf values (not subtrees).
        const sourceKeys = Array.from(await tree.keys());
        const mapped = await Promise.all(
          sourceKeys.map(async (sourceKey) =>
            // Deep maps leave source keys for subtrees alone
            deep && trailingSlash.has(sourceKey)
              ? sourceKey
              : await keyFn(sourceKey, tree)
          )
        );
        // Filter out any cases where the keyFn returned undefined.
        const resultKeys = mapped.filter((key) => key !== undefined);
        return resultKeys;
      };
    }

    return transformed;
  }

  const tree = Tree.from(treelike, { deep });
  return mapFn(tree);
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

  if ((keyFn && !inverseKeyFn) || (!keyFn && inverseKeyFn)) {
    throw new TypeError(
      `map: You must specify both key and inverseKey functions, or neither.`
    );
  }

  if (extension) {
    if (keyFn || inverseKeyFn) {
      throw new TypeError(
        `map: You can't specify extensions and also a key or inverseKey function`
      );
    }
    const parsed = parseExtensions(extension);
    const keyFns = extensionKeyFunctions(
      parsed.sourceExtension,
      parsed.resultExtension
    );
    keyFn = keyFns.key;
    inverseKeyFn = keyFns.inverseKey;
  }

  deep ??= false;
  description ??= "key/value map";
  needsSourceValue ??= true;

  // If key or inverseKey functions weren't specified, look for sidecar functions
  // @ts-ignore
  inverseKeyFn ??= valueFn?.inverseKey;
  // @ts-ignore
  keyFn ??= valueFn?.key;

  return {
    deep,
    description,
    inverseKeyFn,
    keyFn,
    needsSourceValue,
    valueFn,
  };
}
