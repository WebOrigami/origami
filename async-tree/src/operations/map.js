import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";

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
  let deep;
  let description;
  let inverseKeyFn;
  let keyFn;
  let needsSourceValue;
  let valueFn;

  if (!treelike) {
    const error = new TypeError(`map: The tree to map isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  if (typeof options === "function") {
    // Take the single function argument as the valueFn
    valueFn = options;
  } else {
    deep = options.deep;
    description = options.description;
    inverseKeyFn = options.inverseKey;
    keyFn = options.key;
    needsSourceValue = options.needsSourceValue;
    valueFn = options.value;
  }

  deep ??= false;
  description ??= "key/value map";
  // @ts-ignore
  inverseKeyFn ??= valueFn?.inverseKey;
  // @ts-ignore
  keyFn ??= valueFn?.key;
  needsSourceValue ??= true;

  if ((keyFn && !inverseKeyFn) || (!keyFn && inverseKeyFn)) {
    throw new TypeError(
      `map: You must specify both key and inverseKey functions, or neither.`
    );
  }

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
        // Step 1: Map the result key to the source key.
        const sourceKey = (await inverseKeyFn?.(resultKey, tree)) ?? resultKey;

        if (sourceKey === undefined) {
          // No source key means no value.
          return undefined;
        }

        // Step 2: Get the source value.
        let sourceValue;
        if (needsSourceValue) {
          // Normal case: get the value from the source tree.
          sourceValue = await tree.get(sourceKey);
        } else if (deep && trailingSlash.has(sourceKey)) {
          // Only get the source value if it's expected to be a subtree.
          sourceValue = tree;
        }

        // Step 3: Map the source value to the result value.
        let resultValue;
        if (needsSourceValue && sourceValue === undefined) {
          // No source value means no result value.
          resultValue = undefined;
        } else if (deep && Tree.isAsyncTree(sourceValue)) {
          // Map a subtree.
          resultValue = mapFn(sourceValue);
        } else if (valueFn) {
          // Map a single value.
          resultValue = await valueFn(sourceValue, sourceKey, tree);
        } else {
          // Return source value as is.
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
