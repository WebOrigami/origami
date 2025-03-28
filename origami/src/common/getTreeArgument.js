import { Tree, isUnpackable } from "@weborigami/async-tree";
import assertTreeIsDefined from "./assertTreeIsDefined.js";

/**
 * Many Origami built-in functions accept an optional treelike object as their
 * first argument. If no tree is supplied, then the current context for the
 * Origami command is used as the tree.
 *
 * So the argument is optional -- but if supplied, it must be defined. The
 * caller should pass its `arguments` object to this function so that the actual
 * number of supplied arguments can be checked.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {AsyncTree|null} parent
 * @param {IArguments} args
 * @param {Treelike|undefined} treelike
 * @param {string} methodName
 * @param {boolean} [deep]
 * @returns {Promise<AsyncTree>}
 */
export default async function getTreeArgument(
  parent,
  args,
  treelike,
  methodName,
  deep
) {
  assertTreeIsDefined(parent, methodName);

  if (treelike !== undefined) {
    if (isUnpackable(treelike)) {
      treelike = await treelike.unpack();
    }
    if (Tree.isTreelike(treelike)) {
      const options = deep !== undefined ? { deep } : undefined;
      let tree = Tree.from(treelike, options);
      // If the tree was created from a treelike object and does not yet have a
      // parent, make the current tree its parent.
      if (!tree.parent && parent !== undefined) {
        if (parent !== null && !Tree.isAsyncTree(parent)) {
          throw new Error(
            `The parent argument passed to ${methodName} must be a tree.`
          );
        }
        tree.parent = parent;
      }
      return tree;
    }
    throw new Error(
      `The first argument to ${methodName} must be a tree, like an array, object, or files.`
    );
  }

  if (args.length === 0) {
    if (!parent) {
      // Should never happen because assertTreeIsDefined throws an exception.
      throw new Error(
        `${methodName} was called with no tree argument and no parent.`
      );
    }
    return parent;
  }

  throw new Error(`The first argument to ${methodName} was undefined.`);
}
