import GlobTree from "../common/GlobTree.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
  assertTreeIsDefined(this, "globs");
  const result = new GlobTree(tree);
  return result;
}

globs.usage = `@globs <patterns>\tDefine a tree whose keys can include wildcard globs`;
globs.documentation = "https://weborigami.org/language/@globs.html";
