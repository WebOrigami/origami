import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Cast the indicated variant to a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function graph(variant) {
  return variant ? ExplorableGraph.from(variant) : this;
}

graph.usage = `graph <variant>\tConvert JSON, YAML, function, or plain object to a graph`;
graph.documentation = "https://explorablegraph.org/cli/builtins.html#graph";
