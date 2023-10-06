import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the scope of the indicated graph or the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function getScope(graphable) {
  assertScopeIsDefined(this);
  let scope;
  if (graphable) {
    const graph = Graph.from(graphable);
    scope = /** @type {any} */ (graph).scope;
  } else {
    scope = this;
  }
  return scope;
}

getScope.usage = `@scope/get [<graph>]\tReturns the scope of the graph or the current scope`;
getScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
