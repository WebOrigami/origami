import GlobGraph from "../common/GlobGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Define a graph whose keys are globs.
 *
 * @param {GraphVariant} graph
 * @this {Explorable}
 */
export default async function globs(graph) {
  assertScopeIsDefined(this);
  const result = new GlobGraph(graph);
  /** @type {any} */ (result).scope = this;
  return result;
}

globs.usage = `@globs <patterns>\tDefine a graph whose keys can include wildcard globs`;
globs.documentation = "https://graphorigami.org/language/@globs.html";
