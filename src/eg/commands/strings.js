import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function strings(graph) {
  return await ExplorableGraph.strings(graph);
}

strings.usage = `strings(graph)\tCast both the keys and values of the graph to strings`;
