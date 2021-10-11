import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function values(variant) {
  return ExplorableGraph.values(variant);
}

values.usage = `values(graph)\tThe top-level values in the graph`;
