import * as Tree from "../Tree.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, innerKeyFn?: KeyFn, keyFn?: ValueKeyFn, valueFn?: ValueKeyFn }} options
 * @returns
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

  if (!innerKeyFn) {
    if (keyFn) {
      // Enumerate all the inner keys and return the one that maps to the outer key.
      innerKeyFn = async function slowInverseKeyFn(outerKey, tree) {
        // @ts-ignore
        for (const innerKey of await tree.keys()) {
          const innerValue = await tree.get(innerKey);
          if (Tree.isAsyncTree(innerValue) && innerKey === outerKey) {
            return innerKey;
          } else if ((await keyFn(innerValue, innerKey, tree)) === outerKey) {
            return innerKey;
          }
        }
      };
    } else {
      // Inner key is the same as the outer key.
      innerKeyFn = (outerKey, tree) => outerKey;
    }
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
        const innerKey = await innerKeyFn(outerKey, tree);

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
            const innerValue = await tree.get(innerKey);
            return deep && Tree.isAsyncTree(innerValue)
              ? innerKey
              : keyFn(innerValue, innerKey, tree);
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
