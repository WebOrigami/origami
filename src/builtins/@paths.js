import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return an array of paths to the values in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 * @param {string} [prefix]
 */
export default async function paths(variant, prefix = "") {
  assertScopeIsDefined(this);
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const result = [];
  for (const key of await graph.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    if (await ExplorableGraph.isKeyExplorable(graph, key)) {
      const subgraph = await graph.get(key);
      const subPaths = await paths.call(this, subgraph, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `paths(graph)\tReturn an array of paths to the values in the graph`;
