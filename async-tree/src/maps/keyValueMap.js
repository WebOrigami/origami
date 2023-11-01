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
    return Object.assign(
      mapped,
      (innerKeyFn || keyFn) &&
        valueFn && {
          description,

          async get(outerKey) {
            const innerKey =
              innerKeyFn?.(outerKey) ?? keyFn
                ? await defaultInnerKeyFn(tree, keyFn, outerKey)
                : outerKey;
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
        },

      keyFn && {
        async keys() {
          const innerKeys = [...(await tree.keys())];
          const outerKeys = innerKeys.map(keyFn);
          return outerKeys;
        },
      }
    );
  };
}

async function defaultInnerKeyFn(tree, keyFn, outerKey) {
  const innerKeys = [...(await tree.keys())];
  const innerKey = innerKeys.find((key) => keyFn(key) === outerKey);
  return innerKey;
}
