import ExplorableGraph from "../../core/ExplorableGraph.js";
import ExplorableObject from "../../core/ExplorableObject.js";

export default async function keys(arg) {
  const graph = ExplorableObject.explore(arg);
  return await ExplorableGraph.keys(graph);
}

keys.usage = `keys(graph)\tThe top-level keys in the graph`;
