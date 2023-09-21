/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import {
  getScope,
  isPlainObject,
  keySymbol,
  transformObject,
} from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

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

  const textWithGraph = new String(text);
  const scope = getScope(this);
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = addDefault(Graph.from(data), data);
      if (!("parent" in graph)) {
        graph = transformObject(InheritScopeTransform, graph);
      }
      graph.parent = scope;
      // Add diagnostic information to any (non-plain) object result.
      if (graph && typeof graph === "object" && !isPlainObject(graph)) {
        graph[keySymbol] = key;
      }
    }
    return graph;
  };

  return textWithGraph;
}

function addDefault(graph, defaultValue) {
  return Object.assign(Object.create(graph), {
    async get(key) {
      return key === Graph.defaultValueKey ? defaultValue : graph.get(key);
    },
  });
}
