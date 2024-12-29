import { setParent } from "@weborigami/async-tree";
import globKeys from "@weborigami/async-tree/src/operations/globKeys.js";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Define a tree whose keys are globs.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} tree
 * @this {AsyncTree|null}
 */
export default async function globs(tree) {
  assertTreeIsDefined(this, "tree:globs");
  const result = globKeys(tree);
  setParent(this, result);
  return result;
}
