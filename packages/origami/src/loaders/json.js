/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { isPlainObject, keySymbol } from "../common/utilities.js";

/**
 * Load a file as JSON.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("../..").HasString} HasString
 * @param {string|HasString|Graphable} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadJson(input, key) {
  // See notes at yaml.js
  if (Graph.isGraphable(input)) {
    return input;
  }

  const text = String(input);
  const data = JSON.parse(text);

  const deferredGraph = new DeferredGraph(async () => {
    const graph = Graph.from(data);
    // Add diagnostic information.
    if (graph && typeof graph === "object" && !isPlainObject(graph)) {
      graph[keySymbol] = key;
    }
    return graph;
  });

  return new StringWithGraph(text, deferredGraph);
}
