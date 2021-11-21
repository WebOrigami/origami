import ExplorableGraph from "../../core/ExplorableGraph.js";

// @ts-ignore
export default async function plain(variant = this.graph) {
  return await ExplorableGraph.plain(variant);
}

plain.usage = `plain(graph)\tA plain JavaScript object representation of the graph`;
