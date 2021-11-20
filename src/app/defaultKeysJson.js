import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function defaultKeysJson() {
  // @ts-ignore
  const graph = this;
  const keys = await ExplorableGraph.keys(graph);
  const json = JSON.stringify(keys);
  return json;
}
