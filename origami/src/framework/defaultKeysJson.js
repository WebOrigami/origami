/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */

import { Graph } from "@graphorigami/core";

/**
 * Return a default .keys.json file for the current graph.
 *
 * @this {AsyncDictionary|null}
 */
export default async function defaultKeysJson(graphable) {
  const graph = Graph.from(graphable);
  const keys = Array.from(await graph.keys());
  // Skip the key .keys.json if present.
  const filtered = keys.filter((key) => key !== ".keys.json");
  const json = JSON.stringify(filtered);
  return json;
}
