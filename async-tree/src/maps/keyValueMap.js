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
    return Object.assign({}, tree, {
      description,

      async get(outerKey) {
        const innerKey =
          innerKeyFn?.(outerKey) ??
          (await defaultInnerKeyFn(tree, keyFn, outerKey));
        if (!innerKey) {
          return undefined;
        }
        const innerValue = await tree.get(innerKey);
        const outerValue = Tree.isAsyncTree(innerValue)
          ? // Apply map to tree value
            keyValueMap({
              description,
              innerKeyFn,
              keyFn,
              valueFn,
            })(innerValue)
          : valueFn?.(innerValue) ?? innerValue;
        return outerValue;
      },

      async keys() {
        if (!keyFn) {
          return tree.keys();
        }

        const innerKeys = [...(await tree.keys())];
        const outerKeys = innerKeys.map(keyFn);
        return outerKeys;
      },
    });
  };
}

async function defaultInnerKeyFn(tree, keyFn, outerKey) {
  const innerKeys = [...(await tree.keys())];
  const innerKey = innerKeys.find((key) => keyFn(key) === outerKey);
  return innerKey;
}
