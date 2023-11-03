import mapTransform from "./mapTransform.js";

/** @type {WeakMap<AsyncTree, Promise<{ innerKeyToOuterKey: Map<any, any>, outerKeyToInnerKey: Map<any, any> }>>} */
const treeToKeyMapPromises = new WeakMap();

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
  let cachedKeyFn;
  let cachedInnerKeyFn;
  if (keyFn) {
    cachedKeyFn = async function (innerKey, tree) {
      const keyMap = await treeToKeyMap(keyFn, tree);
      return keyMap.innerKeyToOuterKey.get(innerKey);
    };
    cachedInnerKeyFn = async function (outerKey, tree) {
      const keyMap = await treeToKeyMap(keyFn, tree);
      return keyMap.outerKeyToInnerKey.get(outerKey);
    };
  }

  return mapTransform({
    deep,
    description,
    innerKeyFn: cachedInnerKeyFn,
    keyFn: cachedKeyFn,
    valueFn,
  });
}

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @param {import("./mapTransform.js").KeyMapFn} keyFn
 * @param {AsyncTree} tree
 * @returns {Promise<{ innerKeyToOuterKey: Map<any, any>, outerKeyToInnerKey: Map<any, any> }>}
 */
async function treeToKeyMap(keyFn, tree) {
  let keyMapPromise = treeToKeyMapPromises.get(tree);

  if (!keyMapPromise) {
    keyMapPromise = buildKeyMap(keyFn, tree);
    treeToKeyMapPromises.set(tree, keyMapPromise);
  }

  return keyMapPromise;
}

async function buildKeyMap(keyFn, tree) {
  const maps = {
    innerKeyToOuterKey: new Map(),
    outerKeyToInnerKey: new Map(),
  };
  for (const innerKey of await tree.keys()) {
    const outerKey = await keyFn(innerKey, tree);
    maps.innerKeyToOuterKey.set(innerKey, outerKey);
    maps.outerKeyToInnerKey.set(outerKey, innerKey);
  }
  return maps;
}
