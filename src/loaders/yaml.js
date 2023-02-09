import * as YAMLModule from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";
import { isPlainObject, transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @param {string|HasString|PlainObject|Array} input
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadYaml(input, key) {
  let text;
  let data;
  if (isPlainObject(input) || input instanceof Array) {
    data = input;
    text = YAML.stringify(data);
  } else {
    text = String(input);
    data = utilities.parseYaml(text);
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
