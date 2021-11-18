import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultKeysJson() {
  // @ts-ignore
  const graph = this.graph;
  const keys = await ExplorableGraph.keys(graph);
  const json = JSON.stringify(keys);
  return json;
}
