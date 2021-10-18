import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function map(graph, ...maps) {
  let result = graph;
  for (const map of maps) {
    result = ExplorableGraph.map(result, map);
  }
  return result;
}

map.usage = `map(graph, fn)\tMap the values in a graph using a mapping function`;
