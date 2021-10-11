import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function values(variant) {
  const graph = ExplorableGraph.from(variant);
  const results = [];
  for await (const key of graph) {
    results.push(await graph.get(key));
  }
  return results;
}

values.usage = `values(graph)\tThe top-level values in the graph`;
