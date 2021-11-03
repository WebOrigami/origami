import MapGraph from "../../core/MapGraph.js";
import defaultGraph from "./defaultGraph.js";

export default async function nulls(graph = defaultGraph()) {
  return new MapGraph(graph, () => null);
}

nulls.usage = `nulls(graph)\tReturn a new graph with all values equal to null`;
