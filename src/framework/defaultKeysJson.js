import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return a default .keys.json file for the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultKeysJson(variant) {
  const graph = ExplorableGraph.from(variant);
  const keys = Array.from(await graph.keys());
  const json = JSON.stringify(keys);
  return json;
}
