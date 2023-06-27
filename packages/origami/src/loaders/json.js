/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import { getScope, keySymbol, transformObject } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Load a file as JSON.
 *
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("../..").HasString} HasString
 * @param {string|HasString|GraphVariant} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadJson(input, key) {
  // See notes at yaml.js
  if (GraphHelpers.isGraphable(input)) {
    return input;
  }

  const text = String(input);
  const data = JSON.parse(text);

  const textWithGraph = new String(text);
  const scope = getScope(this);
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = GraphHelpers.from(data);
      if (!("parent" in graph)) {
        graph = transformObject(InheritScopeTransform, graph);
      }
      graph.parent = scope;
      graph[keySymbol] = key;
    }
    return graph;
  };

  return textWithGraph;
}
