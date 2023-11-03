import mapTransform from "./mapTransform.js";

/**
 * Return a map transform that caches the transform's inner and outer keys.
 *
 * @typedef {(innerValue: any, innerKey?: any) => any} MapFn
 * @param {{ deep?: boolean, description?: string, keyFn?: (any) => any, valueFn?: MapFn }} options
 * @returns
 */
export default function createCachedKeysTransform({
  deep = false,
  description = "cached keys transform",
  keyFn,
  valueFn,
}) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function cachedKeysTransform(tree) {
    let keyMapsPromise;
    let cachedKeyFn;
    let cachedInnerKeyFn;
    if (keyFn) {
      cachedKeyFn = async function (innerKey) {
        keyMapsPromise ??= buildKeyMaps(tree, keyFn);
        return (await keyMapsPromise).innerKeyToOuterKey.get(innerKey);
      };
      cachedInnerKeyFn = async function (outerKey) {
        keyMapsPromise ??= buildKeyMaps(tree, keyFn);
        return (await keyMapsPromise).outerKeyToInnerKey.get(outerKey);
      };
    }

    const transform = mapTransform({
      deep,
      description,
      innerKeyFn: cachedInnerKeyFn,
      keyFn: cachedKeyFn,
      valueFn,
    });

    return transform(tree);
  };
}

async function buildKeyMaps(tree, keyFn) {
  const maps = {
    innerKeyToOuterKey: new Map(),
    outerKeyToInnerKey: new Map(),
  };
  for (const innerKey of await tree.keys()) {
    const outerKey = await keyFn(innerKey);
    maps.innerKeyToOuterKey.set(innerKey, outerKey);
    maps.outerKeyToInnerKey.set(outerKey, innerKey);
  }
  return maps;
}
