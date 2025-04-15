import { mask } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Apply a mask to a tree
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} sourceTreelike
 * @param {Treelike} maskTreelike
 */
export default async function maskBuiltin(sourceTreelike, maskTreelike) {
  assertTreeIsDefined(this, "tree:mask");
  const result = mask(sourceTreelike, maskTreelike);
  result.parent = this;
  return result;
}
