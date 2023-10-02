import { isGraphable } from "@graphorigami/core/src/Graph.js";
import * as YAMLModule from "yaml";
import ExpressionGraph from "../common/ExpressionGraph.js";
import TextDocument from "../common/TextDocument.js";
import { parseYaml } from "../common/serialize.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadYaml(container, input, key) {
  return new TextDocument(input, {
    async contents() {
      const parsed = parseYaml(String(input));
      if (isGraphable(parsed)) {
        const graph = new (FileTreeTransform(ExpressionGraph))(parsed);
        graph.parent = container;
        return graph;
      } else {
        return parsed;
      }
    },
  });
}
