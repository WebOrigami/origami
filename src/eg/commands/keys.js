import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Return the top-level keys in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function keys(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  return await ExplorableGraph.keys(graph);
}

keys.usage = `keys(graph)\tThe top-level keys in the graph`;
