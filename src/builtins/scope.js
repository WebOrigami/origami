import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Returns the scope of the indicated graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default async function scope(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const scope = /** @type {any} */ (graph).scope;
  return scope;
}

scope.usage = `scope <graph>]\tReturns the scope of the graph`;
scope.documentation = "https://explorablegraph.org/cli/builtins.html#scope";
