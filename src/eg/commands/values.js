import ExplorableObject from "../../core/ExplorableObject.js";

export default async function values(arg) {
  const graph = ExplorableObject.explore(arg);
  const results = [];
  for await (const key of graph) {
    results.push(await graph.get(key));
  }
  return results;
}

values.usage = `values(graph)\tThe top-level values in the graph`;
