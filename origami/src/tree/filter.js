import { Tree } from "@weborigami/async-tree";
import FilterTree from "../common/FilterTree.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} sourceTreelike
 * @param {Treelike} filterTreelike
 */
export default async function filter(sourceTreelike, filterTreelike) {
  assertTreeIsDefined(this, "tree:filter");
  const sourceTree = Tree.from(sourceTreelike, { parent: this });
  const filterTree = Tree.from(filterTreelike, { deep: true, parent: this });
  const result = new FilterTree(sourceTree, filterTree);
  result.parent = this;
  return result;
}

filter.usage = `@filter <tree>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://weborigami.org/language/@filter.html";
