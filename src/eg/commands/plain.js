import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function plain(variant) {
  return await ExplorableGraph.plain(variant);
}

plain.usage = `plain(graph)\tA plain JavaScript object representation of the graph`;
