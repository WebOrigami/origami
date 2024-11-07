import { deepValues } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function deepValuesBuiltin(treelike) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:deepValues",
    true
  );
  return deepValues(tree);
}

helpRegistry.set(
  "tree:deepValues",
  "(tree) - The in-order leaf values of the tree"
);
