/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { ObjectGraph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import ExpressionGraph from "../common/ExpressionGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  getScope,
  graphInContext,
  isPlainObject,
  keySymbol,
  parseYaml,
  transformObject,
} from "../core/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @param {string|HasString|GraphVariant} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadYaml(input, key) {
  // If the input is a graph variant, return it as is. This situation can arise
  // when an Origami graph contains an assigment whose right-hand side is a
  // graph and whose left-hand side a name ending in `.yaml`. In that situation,
  // we return the input as is, and rely on the ori CLI or the server to
  // eventually render the graph to YAML.
  if (ExplorableGraph.canCastToExplorable(input)) {
    return input;
  }

  const text = String(input);
  const data = parseYaml(text);

  /** @type {any} */
  const textWithGraph = new String(text);
  const scope = getScope(this);
  let graph;

  textWithGraph.toGraph = () => {
    if (!graph) {
      if (isPlainObject(data) || data instanceof Array) {
        graph = new (FileTreeTransform(ExpressionGraph))(data);
      } else if (!("parent" in graph)) {
        graph = transformObject(FileTreeTransform, graph);
      }
      graph.parent = scope;
      graph[keySymbol] = key;
    }
    return graph;
  };

  textWithGraph.toFunction = () => {
    const graph = textWithGraph.toGraph();
    const fn = async function fn(key, ...rest) {
      if (key === undefined) {
        return graph;
      }
      let value;
      if (
        typeof key === "string" ||
        key instanceof String ||
        typeof key === "number"
      ) {
        value = await graph.get(key);
      } else {
        // Construct new graph with key in scope as @input.
        const ambients = new ObjectGraph({
          "@input": key,
        });
        const ambientsGraph = graphInContext(ambients, graph.parent);
        ambientsGraph[keySymbol] = graph[keySymbol];
        value = graphInContext(graph, ambientsGraph);
      }
      if (rest.length > 0) {
        value = await ExplorableGraph.traverse(value, ...rest);
      }
      return value;
    };
    return fn;
  };

  return textWithGraph;
}
