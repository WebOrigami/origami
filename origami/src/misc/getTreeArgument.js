import { Tree } from "@weborigami/async-tree";
import { isTreelike } from "@weborigami/async-tree/src/Tree.js";
import assertScopeIsDefined from "./assertScopeIsDefined.js";

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
 * @param {AsyncTree|null} scope
 * @param {IArguments} args
 * @param {Treelike|undefined} treelike
 * @param {string} methodName
 * @returns {Promise<AsyncTree>}
 */
export default async function getTreeArgument(
  scope,
  args,
  treelike,
  methodName
) {
  assertScopeIsDefined(scope);

  if (treelike !== undefined) {
    if (isTreelike(treelike)) {
      return Tree.from(treelike);
    }
    throw new Error(
      `${methodName}: The first argument must be a tree, like an array, object, or files.`
    );
  }

  if (args.length === 0) {
    if (!scope) {
      // Should never happen because assertScopeIsDefined throws an exception.
      throw new Error(
        `${methodName} was called with no tree argument and no scope.`
      );
    }
    return scope.get("@current");
  }

  throw new Error(`${methodName}: The first argument was undefined.`);
}
