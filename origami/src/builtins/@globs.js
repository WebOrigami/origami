import GlobTree from "../common/GlobTree.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Define a tree whose keys are globs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} tree
 * @this {AsyncDictionary|null}
 */
export default async function globs(tree) {
  assertScopeIsDefined(this);
  const result = new GlobTree(tree);
  /** @type {any} */ (result).scope = this;
  return result;
}

globs.usage = `@globs <patterns>\tDefine a tree whose keys can include wildcard globs`;
globs.documentation = "https://graphorigami.org/language/@globs.html";
