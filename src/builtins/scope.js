import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Returns the scope of the current graph.
 *
 * @this {Explorable}
 * @param {any[]} keys
 */
export default async function scope(...keys) {
  const scope = /** @type {any} */ (this).scope;
  return ExplorableGraph.traverse(scope, ...keys);
}

scope.usage = `scope [...keys]\tReturns the current scope`;
scope.documentation = "https://explorablegraph.org/pika/builtins.html#scope";
