import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function map(graph, mapFn) {
  return ExplorableGraph.map(graph, mapFn);
}

map.usage = `map(graph, fn)\tMap the values in a graph using a mapping function`;
