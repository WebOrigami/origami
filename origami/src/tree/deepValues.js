import { deepValues } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

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
    "deepValues",
    true
  );
  return deepValues(tree);
}
