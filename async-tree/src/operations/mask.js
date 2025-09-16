import * as trailingSlash from "../trailingSlash.js";
import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";
import isTreelike from "./isTreelike.js";

/**
 * Given trees `a` and `b`, return a masked version of `a` where only the keys
 * that exist in `b` and have truthy values are kept. The filter operation is
 * deep: if a value from `a` is a subtree, it will be filtered recursively.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} a
 * @param {Treelike} b
 * @returns {AsyncTree}
 */
export default function mask(a, b) {
  assertIsTreelike(a, "filter", 0);
  assertIsTreelike(b, "filter", 1);
  a = from(a);
  b = from(b, { deep: true });

  return {
    async get(key) {
      // The key must exist in b and return a truthy value
      const bValue = await b.get(key);
      if (!bValue) {
        return undefined;
      }
      let aValue = await a.get(key);
      if (isTreelike(aValue)) {
        // Filter the subtree
        return mask(aValue, bValue);
      } else {
        return aValue;
      }
    },

    async keys() {
      // Use a's keys as the basis
      const aKeys = [...(await a.keys())];
      const bValues = await Promise.all(aKeys.map((key) => b.get(key)));
      // An async tree value in b implies that the a key should have a slash
      const aKeySlashes = aKeys.map((key, index) =>
        trailingSlash.toggle(
          key,
          trailingSlash.has(key) || isAsyncTree(bValues[index])
        )
      );
      // Remove keys that don't have values in b
      const keys = aKeySlashes.filter((key, index) => bValues[index] ?? false);
      return keys;
    },
  };
}
