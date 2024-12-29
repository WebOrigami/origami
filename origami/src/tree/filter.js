import { filter } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} sourceTreelike
 * @param {Treelike} filterTreelike
 */
export default async function filterBuiltin(sourceTreelike, filterTreelike) {
  assertTreeIsDefined(this, "tree:filter");
  const result = filter(sourceTreelike, filterTreelike);
  result.parent = this;
  return result;
}
