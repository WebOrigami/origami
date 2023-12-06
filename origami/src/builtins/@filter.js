import { Scope } from "@weborigami/language";
import FilterTree from "../common/FilterTree.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {Treelike} filterVariant
 */
export default async function filter(treelike, filterVariant) {
  assertScopeIsDefined(this);
  /** @type {AsyncTree} */
  let result = new FilterTree(treelike, filterVariant);
  result = Scope.treeWithScope(result, this);
  return result;
}

filter.usage = `@filter <tree>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://weborigami.org/language/@filter.html";
