import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Return an array of paths to the values in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 * @param {string} [prefix]
 */
export default async function paths(variant, prefix = "") {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const result = [];
  for await (const key of graph) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await graph.get(key);
    result.push(valuePath);
    if (ExplorableGraph.isExplorable(value)) {
      const subPaths = await paths(value, valuePath);
      result.push(...subPaths);
    }
  }
  return result;
}

paths.usage = `paths(graph)\tReturn an array of paths to the values in the graph`;
