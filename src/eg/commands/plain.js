import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function plain(graph) {
  return await ExplorableGraph.plain(graph);
}

plain.usage = `plain(graph)\tA plain JavaScript object representation of the graph`;
