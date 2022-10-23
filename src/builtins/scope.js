import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Returns the scope of the indicated graph or the current scope.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function scope(variant) {
  let scope;
  if (variant) {
    const graph = ExplorableGraph.from(variant);
    scope = /** @type {any} */ (graph).scope;
  } else {
    scope = this;
  }
  return scope;
}

scope.usage = `scope [<graph>]\tReturns the scope of the graph or the current scope`;
scope.documentation = "https://graphorigami.org/cli/builtins.html#scope";
