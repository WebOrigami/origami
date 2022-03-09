import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the top-level keys in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function keys(variant) {
  const graph = variant ? ExplorableGraph.from(variant) : this;
  return await ExplorableGraph.keys(graph);
}

keys.usage = `keys <graph>\tThe top-level keys in the graph`;
keys.documentation = "https://explorablegraph.org/cli/builtins.html#keys";
