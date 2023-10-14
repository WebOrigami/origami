import GlobGraph from "../common/GlobGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Define a graph whose keys are globs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @param {Graphable} graph
 * @this {AsyncDictionary|null}
 */
export default async function globs(graph) {
  assertScopeIsDefined(this);
  const result = new GlobGraph(graph);
  /** @type {any} */ (result).scope = this;
  return result;
}

globs.usage = `@globs <patterns>\tDefine a graph whose keys can include wildcard globs`;
globs.documentation = "https://graphorigami.org/language/@globs.html";
