import { GraphHelpers } from "@graphorigami/core";
import Scope from "../../common/Scope.js";
import { graphInContext, keySymbol } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a copy of the given graph that has the indicated graphs as its scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @param {GraphVariant} variant
 * @param  {...(GraphVariant|null)} scopeGraphs
 * @this {AsyncDictionary|null}
 */
export default function setScope(variant, ...scopeGraphs) {
  assertScopeIsDefined(this);
  const graph = GraphHelpers.from(variant);
  const scope = scopeGraphs.length === 0 ? this : new Scope(...scopeGraphs);
  const result = graphInContext(graph, scope);
  result[keySymbol] = graph[keySymbol];
  return result;
}

setScope.usage = `@scope/set <graph>, <...graphs>\tReturns a graph copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
