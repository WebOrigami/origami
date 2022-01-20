import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function graph(variant) {
  return ExplorableGraph.from(variant);
}

graph.usage = `graph <variant>\tConvert JSON, YAML, function, or plain object to a graph`;
graph.documentation = "https://explorablegraph.org/pika/builtins.html#graph";
