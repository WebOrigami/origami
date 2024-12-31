import { setParent } from "@weborigami/async-tree";
import regExpKeys from "@weborigami/async-tree/src/operations/regExpKeys.js";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Define a tree whose keys are regular expression strings.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} tree
 * @this {AsyncTree|null}
 */
export default async function regExpKeysBuiltin(tree) {
  assertTreeIsDefined(this, "tree:globs");
  const result = regExpKeys(tree);
  setParent(this, result);
  return result;
}
