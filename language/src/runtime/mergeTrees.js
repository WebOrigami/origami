import { isPlainObject, isUnpackable, Tree } from "@weborigami/async-tree";
import assignPropertyDescriptors from "./assignPropertyDescriptors.js";

/**
 * Create a tree that's the result of merging the given trees.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {(Maplike|null)[]} trees
 */
export default async function mergeTrees(...trees) {
  // Filter out null or undefined trees.
  /** @type {Maplike[]}
   * @ts-ignore */
  const filtered = trees.filter((tree) => tree);

  if (filtered.length === 1) {
    // Only one tree, no need to merge.
    return filtered[0];
  }

  // Unpack any packed objects.
  const unpacked = await Promise.all(
    filtered.map((obj) =>
      isUnpackable(obj) ? /** @type {any} */ (obj).unpack() : obj,
    ),
  );

  // If all trees are plain objects, return a plain object.
  if (unpacked.every((tree) => isPlainObject(tree) && !Tree.isMap(tree))) {
    // Use our Object.assign variation that avoids invoking property getters.
    return assignPropertyDescriptors({}, ...unpacked);
  }

  // Merge the trees.
  const result = Tree.merge(...unpacked);
  return result;
}
