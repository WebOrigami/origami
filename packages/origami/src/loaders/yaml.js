import { Graph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import ExpressionGraph from "../common/ExpressionGraph.js";
import TextWithContents from "../common/TextWithContents.js";
import { parseYaml } from "../common/serialize.js";
import { isPlainObject } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").HasString} HasString
 *
 * @param {AsyncDictionary|null} container
 * @param {string|HasString|Graphable} input
 * @param {any} [key]
 */
export default function loadYaml(container, input, key) {
  // If the input is a graph variant, return it as is. This situation can arise
  // when an Origami graph contains an assigment whose right-hand side is a
  // graph and whose left-hand side a name ending in `.yaml`. In that situation,
  // we return the input as is, and rely on the ori CLI or the server to
  // eventually render the graph to YAML.
  if (Graph.isGraphable(input)) {
    return input;
  }

  return new TextWithContents(input, async () => {
    const data = parseYaml(String(input));
    if (isPlainObject(data) || data instanceof Array) {
      const graph = new (FileTreeTransform(ExpressionGraph))(data);
      return graph;
    } else {
      return data;
    }
  });
}
