import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import isTreelike from "./isTreelike.js";
import keys from "./keys.js";

/**
 * Given trees `a` and `b`, return a masked version of `a` where only the keys
 * that exist in `b` and have truthy values are kept. The filter operation is
 * deep: if a value from `a` is a subtree, it will be filtered recursively.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} aTreelike
 * @param {Treelike} bTreelike
 * @returns {Promise<AsyncTree>}
 */
export default async function mask(aTreelike, bTreelike) {
  const aTree = await getTreeArgument(aTreelike, "filter", { position: 0 });
  const bTree = await getTreeArgument(bTreelike, "filter", {
    deep: true,
    position: 1,
  });

  return Object.assign(new AsyncMap(), {
    description: "mask",

    async get(key) {
      // The key must exist in b and return a truthy value
      const bValue = await bTree.get(key);
      if (!bValue) {
        return undefined;
      }
      let aValue = await aTree.get(key);
      if (isTreelike(aValue)) {
        // Filter the subtree
        return mask(aValue, bValue);
      } else {
        return aValue;
      }
    },

    async keys() {
      // Use a's keys as the basis
      const aKeys = await keys(aTree);
      const bValues = await Promise.all(aKeys.map((key) => bTree.get(key)));
      // An async tree value in b implies that the a key should have a slash
      const aKeySlashes = aKeys.map((key, index) =>
        trailingSlash.toggle(
          key,
          trailingSlash.has(key) || isAsyncTree(bValues[index])
        )
      );
      // Remove keys that don't have values in b
      const treeKeys = aKeySlashes.filter(
        (key, index) => bValues[index] ?? false
      );
      return treeKeys;
    },

    source: aTree,
  });
}
