import * as Tree from "../Tree.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @param {{ description?: string, innerKeyFn?: (any) => any, keyFn?: (any) => any, valueFn?: (any) => any }} options
 * @returns
 */
export default function createMapTransform({
  description = "key/value map",
  innerKeyFn,
  keyFn,
  valueFn,
}) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function mapTransform(tree) {
    const transform = Object.create(tree);
    transform.description = description;

    if (keyFn || innerKeyFn || valueFn) {
      transform.get = async (outerKey) => {
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
          ? mapTransform // Map a subtree.
          : valueFn; // Map a single value.
        const outerValue = mapFn ? await mapFn(innerValue) : innerValue;

        return outerValue;
      };
    }

    if (keyFn) {
      transform.keys = async () => {
        const innerKeys = [...(await tree.keys())];
        const outerKeys = await Promise.all(innerKeys.map(keyFn));
        return outerKeys;
      };
    }

    return transform;
  };
}

// Enumerate all the inner keys and return the one that maps to the outer key.
async function slowInverseKeyFn(tree, keyFn, outerKey) {
  for (const innerKey of await tree.keys()) {
    if ((await keyFn(innerKey)) === outerKey) {
      return innerKey;
    }
  }
}
