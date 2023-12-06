import { Scope } from "@weborigami/language";
import GlobTree from "../common/GlobTree.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

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
  assertScopeIsDefined(this);
  /** @type {AsyncTree} */
  let result = new GlobTree(tree);
  result = Scope.treeWithScope(result, this);
  return result;
}

globs.usage = `@globs <patterns>\tDefine a tree whose keys can include wildcard globs`;
globs.documentation = "https://weborigami.org/language/@globs.html";
