import * as trailingSlash from "../trailingSlash.js";
import isPlainObject from "../utilities/isPlainObject.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";
import keys from "./keys.js";

/**
 * Return a tree that performs a shallow merge of the given trees.
 *
 * This is similar to an object spread in JavaScript extended to asynchronous
 * trees. Given a set of trees, the `get` method looks at each tree in turn,
 * starting from the *last* tree and working backwards to the first. If a tree
 * returns a defined value for the key, that value is returned. If none of the
 * trees return a defined value, the `get` method returns undefined.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").PlainObject} PlainObject
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike[]} sources
 * @returns {(AsyncTree & { description?: string, trees?: AsyncTree[]}) |
 * PlainObject}
 */
export default function merge(...sources) {
  const filtered = sources.filter((source) => source);

  // If all arguments are plain objects, return a plain object.
  if (
    filtered.every((source) => !isAsyncTree(source) && isPlainObject(source))
  ) {
    return filtered.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }

  const trees = filtered.map((treelike) => from(treelike));

  if (trees.length === 0) {
    throw new TypeError("merge: all trees are null or undefined");
  } else if (trees.length === 1) {
    // Only one tree, no need to merge
    return trees[0];
  }

  return {
    description: "merge",

    async get(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = trees.length - 1; index >= 0; index--) {
        const tree = trees[index];
        const value = await tree.get(key);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    },

    async keys() {
      const treeKeys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of trees) {
        for (const key of await keys(tree)) {
          // Remove the alternate form of the key (if it exists)
          const alternateKey = trailingSlash.toggle(key);
          if (alternateKey !== key) {
            treeKeys.delete(alternateKey);
          }

          treeKeys.add(key);
        }
      }
      return treeKeys;
    },

    get trees() {
      return trees;
    },
  };
}
