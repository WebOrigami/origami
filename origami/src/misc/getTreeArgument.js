import { Tree } from "@weborigami/async-tree";
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
 * @returns {Promise<AsyncTree>}
 */
export default async function getTreeArgument(scope, args, treelike) {
  assertScopeIsDefined(scope);

  if (treelike !== undefined) {
    return Tree.from(treelike);
  }

  if (args.length === 0) {
    if (!scope) {
      // Should never happen because assertScopeIsDefined throws an exception.
      throw new Error(
        "An Origami tree function was called with no tree argument and no scope."
      );
    }
    return scope.get("@current");
  }

  throw new Error(
    "An Origami tree function was called with an initial argument, but its value is undefined."
  );
}
