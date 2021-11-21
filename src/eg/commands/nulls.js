import MapGraph from "../../core/MapGraph.js";

// @ts-ignore
export default function nulls(graph = this.graph) {
  return new MapGraph(graph, () => null);
}

nulls.usage = `nulls(graph)\tReturn a new graph with all values equal to null`;
