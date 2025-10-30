import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
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
 * @param {Treelike[]} treelikes
 * @returns {Promise}
 */
export default async function merge(...treelikes) {
  const filtered = treelikes.filter((source) => source);
  const unpacked = await Promise.all(
    filtered.map(async (source) =>
      isUnpackable(source) ? await source.unpack() : source
    )
  );

  // If all arguments are plain objects, return a plain object.
  if (
    unpacked.every((source) => !isAsyncTree(source) && isPlainObject(source))
  ) {
    return unpacked.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }

  const sources = unpacked.map((treelike) => from(treelike));

  if (sources.length === 0) {
    throw new TypeError("merge: all trees are null or undefined");
  } else if (sources.length === 1) {
    // Only one tree, no need to merge
    return sources[0];
  }

  return Object.assign(new AsyncMap(), {
    description: "merge",

    async get(key) {
      // Check trees for the indicated key in reverse order.
      for (let index = sources.length - 1; index >= 0; index--) {
        const tree = sources[index];
        const value = await tree.get(key);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    },

    async *keys() {
      const treeKeys = new Set();
      // Collect keys in the order the trees were provided.
      for (const tree of sources) {
        for (const key of await keys(tree)) {
          // Remove the alternate form of the key (if it exists)
          const alternateKey = trailingSlash.toggle(key);
          if (alternateKey !== key) {
            treeKeys.delete(alternateKey);
          }

          treeKeys.add(key);
        }
      }
      yield* treeKeys;
    },

    sources,
  });
}
