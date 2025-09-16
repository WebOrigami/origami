import {
  isPlainObject,
  isUnpackable,
  setParent,
  Tree,
} from "@weborigami/async-tree";

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
  if (
    unpacked.every((tree) => isPlainObject(tree) && !Tree.isAsyncTree(tree))
  ) {
    // If we do an Object.assign, we'd evaluate getters.
    // To avoid that, we'll merge property descriptors.
    const result = {};
    for (const obj of unpacked) {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (descriptor.value !== undefined) {
          result[key] = descriptor.value;
        } else {
          Object.defineProperty(result, key, descriptor);
        }
      }
    }
    return result;
  }

  // Merge the trees.
  const result = Tree.merge(...unpacked);
  setParent(result, this);
  return result;
}
