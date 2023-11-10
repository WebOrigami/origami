import * as Tree from "../Tree.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, inverseKeyMap?: KeyFn, keyMap?: KeyFn, valueMap?: ValueKeyFn }} options
 */
export default function createMapTransform(options) {
  let deep;
  let description;
  let inverseKeyMap;
  let keyMap;
  let valueMap;
  if (typeof options === "function") {
    // Take the single function argument as the valueMap
    valueMap = options;
  } else {
    deep = options.deep ?? false;
    description = options.description ?? "key/value map";
    inverseKeyMap = options.inverseKeyMap;
    keyMap = options.keyMap;
    valueMap = options.valueMap;
  }

  if ((keyMap && !inverseKeyMap) || (!keyMap && inverseKeyMap)) {
    throw new TypeError(
      `mapTransform: You must specify both keyMap and inverseKeyMap, or neither.`
    );
  }

  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function mapTransform(tree) {
    const transform = Object.create(tree);
    transform.description = description;

    if (keyMap || valueMap) {
      transform.get = async (resultKey) => {
        // Step 1: Map the result key to the source key.
        const isSubtree = deep && (await Tree.isKeyForSubtree(tree, resultKey));
        const sourceKey =
          !isSubtree && inverseKeyMap
            ? await inverseKeyMap(resultKey, tree)
            : resultKey;

        if (!sourceKey) {
          // No source key means no value.
          return undefined;
        }

        // Step 2: Get the source value.
        const sourceValue = await tree.get(sourceKey);

        // Step 3: Map the source value to the result value.
        let resultValue;
        if (sourceValue === undefined) {
          // No source value means no result value.
          resultValue = undefined;
        } else if (deep && Tree.isAsyncTree(sourceValue)) {
          // Map a subtree.
          resultValue = mapTransform(sourceValue);
        } else if (valueMap) {
          // Map a single value.
          resultValue = await valueMap(sourceValue, sourceKey, tree);
        } else {
          // Return source value as is.
          resultValue = sourceValue;
        }

        return resultValue;
      };
    }

    if (keyMap) {
      transform.keys = async () => {
        // Apply the keyMap to source keys for leaf values (not subtrees).
        const innerKeys = [...(await tree.keys())];
        const mapped = await Promise.all(
          innerKeys.map(async (sourceKey) => {
            let resultKey;
            if (deep && (await Tree.isKeyForSubtree(tree, sourceKey))) {
              resultKey = sourceKey;
            } else {
              resultKey = await keyMap(sourceKey, tree);
            }
            return resultKey;
          })
        );
        // Filter out any cases where the keyMap returned undefined.
        const outerKeys = mapped.filter((key) => key !== undefined);
        return outerKeys;
      };
    }

    return transform;
  };
}
