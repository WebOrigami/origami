import * as Tree from "../Tree.js";

/**
 *
 * @param {{ description?: string, innerKeyFn?: (any) => any, keyFn?: (any) => any, valueFn?: (any) => any }} options
 * @returns
 */
export default function keyValueMap({
  description = "key/value map",
  innerKeyFn,
  keyFn,
  valueFn,
}) {
  /**
   * @type {import("../..").TreeTransform}
   */
  return function applyKeyValueMap(tree) {
    const mapped = Object.create(tree);
    mapped.description = description;

    if (keyFn || innerKeyFn || valueFn) {
      mapped.get = async (outerKey) => {
        // Step 1: Map the outer key to the inner key.
        let innerKey;
        if (innerKeyFn) {
          innerKey = await innerKeyFn(outerKey);
        } else if (keyFn) {
          innerKey = await slowInverseKeyFn(tree, keyFn, outerKey);
        } else {
          innerKey = outerKey;
        }

        if (!innerKey) {
          // No inner key means no value.
          return undefined;
        }

        // Step 2: Get the inner value.
        const innerValue = await tree.get(innerKey);

        // Step 3: Map the inner value to the outer value.
        const mapFn = Tree.isAsyncTree(innerValue)
          ? applyKeyValueMap // Map a subtree.
          : valueFn; // Map a single value.
        const outerValue = mapFn ? await mapFn(innerValue) : innerValue;

        return outerValue;
      };
    }

    if (keyFn) {
      mapped.keys = async () => {
        const innerKeys = [...(await tree.keys())];
        const outerKeys = innerKeys.map(keyFn);
        return outerKeys;
      };
    }

    return mapped;
  };
}

// Enumerate all the inner keys and return the one that maps to the outer key.
async function slowInverseKeyFn(tree, keyFn, outerKey) {
  const innerKeys = [...(await tree.keys())];
  const innerKey = innerKeys.find((key) => keyFn(key) === outerKey);
  return innerKey;
}
