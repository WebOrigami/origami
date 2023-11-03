import createMapTransform from "./createMapTransform.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @typedef {(innerValue: any, innerKey?: any) => any} MapFn
 * @param {{ deep?: boolean, description?: string, keyFn?: MapFn, valueFn?: MapFn }} options
 * @returns
 */
export default function createCachedMapTransform({
  deep = false,
  description = "cached key/value map",
  keyFn,
  valueFn,
}) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function cachedMapTransform(tree) {
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

    const transform = createMapTransform({
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
    const innerValue = await tree.get(innerKey);
    const outerKey = await keyFn(innerValue, innerKey);
    maps.innerKeyToOuterKey.set(innerKey, outerKey);
    maps.outerKeyToInnerKey.set(outerKey, innerKey);
  }
  return maps;
}
