import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function values(variant) {
  variant = variant ?? this;
  return ExplorableGraph.values(variant);
}

values.usage = `values(graph)\tThe top-level values in the graph`;
