import ExplorableGraph from "../../core/ExplorableGraph.js";

// @ts-ignore
export default async function values(variant = this.graph) {
  return ExplorableGraph.values(variant);
}

values.usage = `values(graph)\tThe top-level values in the graph`;
