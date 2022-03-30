import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Returns the scope of the current graph.
 *
 * @this {Explorable}
 * @param {any[]} keys
 */
export default async function scope(...keys) {
  return ExplorableGraph.traverse(this, ...keys);
}

scope.usage = `scope [...keys]\tReturns the current scope`;
scope.documentation = "https://explorablegraph.org/cli/builtins.html#scope";
