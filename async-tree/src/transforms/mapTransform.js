import * as Tree from "../Tree.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, innerKeyFn?: KeyFn, keyFn?: KeyFn, valueFn?: ValueKeyFn }} options
 */
export default function createMapTransform(options) {
  let deep;
  let description;
  let innerKeyFn;
  let keyFn;
  let valueFn;
  if (typeof options === "function") {
    // Take the single function argument as the valueFn
    valueFn = options;
  } else {
    deep = options.deep ?? false;
    description = options.description ?? "key/value map";
    innerKeyFn = options.innerKeyFn;
    keyFn = options.keyFn;
    valueFn = options.valueFn;
  }

  if ((keyFn && !innerKeyFn) || (!keyFn && innerKeyFn)) {
    throw new TypeError(
      `mapTransform: You must specify both keyFn and innerKeyFn, or neither.`
    );
  }

  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function mapTransform(tree) {
    const transform = Object.create(tree);
    transform.description = description;

    if (keyFn || valueFn) {
      transform.get = async (outerKey) => {
        // Step 1: Map the outer key to the inner key.
        const isSubtree = deep && (await Tree.isKeyForSubtree(tree, outerKey));
        const innerKey =
          !isSubtree && innerKeyFn
            ? await innerKeyFn(outerKey, tree)
            : outerKey;

        if (!innerKey) {
          // No inner key means no value.
          return undefined;
        }

        // Step 2: Get the inner value.
        const innerValue = await tree.get(innerKey);

        // Step 3: Map the inner value to the outer value.
        let outerValue;
        if (innerValue === undefined) {
          // No inner value means no outer value.
          outerValue = undefined;
        } else if (deep && Tree.isAsyncTree(innerValue)) {
          // Map a subtree.
          outerValue = mapTransform(innerValue);
        } else if (valueFn) {
          // Map a single value.
          outerValue = await valueFn(innerValue, innerKey, tree);
        } else {
          // Return inner value as is.
          outerValue = innerValue;
        }

        return outerValue;
      };
    }

    if (keyFn) {
      transform.keys = async () => {
        // Apply the keyFn to inner keys for leaf values (not subtrees).
        const innerKeys = [...(await tree.keys())];
        const mapped = await Promise.all(
          innerKeys.map(async (innerKey) => {
            let outerKey;
            if (deep && (await Tree.isKeyForSubtree(tree, innerKey))) {
              outerKey = innerKey;
            } else {
              outerKey = await keyFn(innerKey, tree);
            }
            return outerKey;
          })
        );
        // Filter out any cases where the keyFn returned undefined.
        const outerKeys = mapped.filter((key) => key !== undefined);
        return outerKeys;
      };
    }

    return transform;
  };
}
