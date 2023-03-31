import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return a default .keys.json file for the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultKeysJson(variant) {
  const graph = ExplorableGraph.from(variant);
  const keys = Array.from(await graph.keys());
  // Skip the key .keys.json if present.
  const filtered = keys.filter((key) => key !== ".keys.json");
  const json = JSON.stringify(filtered);
  return json;
}
