import { isPlainObject, isUnpackable, merge } from "@weborigami/async-tree";
import Scope from "./Scope.js";

/**
 * Create a tree that's the result of merging the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {(Treelike|null)[]} trees
 */
export default async function mergeTrees(...trees) {
  // Filter out null or undefined trees.
  /** @type {Treelike[]}
   * @ts-ignore */
  const filtered = trees.filter((tree) => tree);

  if (filtered.length === 1) {
    // Only one tree, no need to merge.
    return filtered[0];
  }

  // Unpack any packed objects.
  const unpacked = await Promise.all(
    filtered.map((obj) =>
      isUnpackable(obj) ? /** @type {any} */ (obj).unpack() : obj
    )
  );

  // If all trees are plain objects, return a plain object.
  if (unpacked.every((tree) => isPlainObject(tree))) {
    return mergeObjects(...unpacked);
  }

  // If all trees are arrays, return an array.
  if (unpacked.every((tree) => Array.isArray(tree))) {
    return unpacked.flat();
  }

  // If a tree can take a scope, give it one that includes the other trees and
  // the current scope.
  const scopedTrees = unpacked.map((tree) => {
    const otherTrees = unpacked.filter((g) => g !== tree);
    const scope = new Scope(...otherTrees, this);
    // Each tree will be included first in its own scope.
    return Scope.treeWithScope(tree, scope);
  });

  // Merge the trees.
  const result = merge(...scopedTrees);

  // Give the overall mixed tree a scope that includes the component trees and
  // the current scope.
  /** @type {any} */ (result).scope = new Scope(result, this);

  return result;
}

/**
 * Merge the indicated plain objects. If a key is present in multiple objects,
 * the value from the first object is used.
 *
 * This is similar to calling Object.assign() with the objects in reverse order,
 * but we want to ensure the keys end up in the same order they're encountered
 * in the objects.
 *
 * @param  {...any} objects
 */
function mergeObjects(...objects) {
  const result = {};
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      result[key] ??= obj[key];
    }
  }
  return result;
}
