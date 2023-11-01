import * as Tree from "../Tree.js";
import completeTree from "./completeTree.js";

export default function keyValueMap({
  description = "key/value transform",
  innerKeyFn,
  keyFn,
  valueFn,
}) {
  return completeTree((tree) => ({
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
        : valueFn(innerValue);
      return outerValue;
    },

    async keys() {
      const innerKeys = [...(await tree.keys())];
      const outerKeys = innerKeys.map(keyFn);
      return outerKeys;
    },
  }));
}

async function defaultInnerKeyFn(tree, keyFn, outerKey) {
  const innerKeys = [...(await tree.keys())];
  const innerKey = innerKeys.find((key) => keyFn(key) === outerKey);
  return innerKey;
}
