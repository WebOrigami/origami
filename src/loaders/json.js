import ExplorableGraph from "../core/ExplorableGraph.js";
import { isPlainObject, transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Load a file as YAML.
 *
 * @param {string|HasString|PlainObject|Array} input
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadJson(input, key) {
  let text;
  let data;
  if (isPlainObject(input) || input instanceof Array) {
    data = input;
    text = JSON.stringify(data, null, 2);
  } else {
    text = String(input);
    data = JSON.parse(text);
  }

  const textWithGraph = new String(text);
  const scope = this;
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = ExplorableGraph.from(data);
      if (!("parent" in graph)) {
        graph = transformObject(InheritScopeTransform, graph);
      }
      graph.parent = scope;
    }
    return graph;
  };

  return textWithGraph;
}
