import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the scope of the indicated graph or the current scope.
 *
 * @this {Explorable|null}
 * @param {GraphVariant} [variant]
 */
export default async function getScope(variant) {
  assertScopeIsDefined(this);
  let scope;
  if (variant) {
    const graph = ExplorableGraph.from(variant);
    scope = /** @type {any} */ (graph).scope;
  } else {
    scope = this;
  }
  return scope;
}

getScope.usage = `@scope/get [<graph>]\tReturns the scope of the graph or the current scope`;
getScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
