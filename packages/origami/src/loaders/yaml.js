import { isGraphable } from "@graphorigami/core/src/Graph.js";
import * as YAMLModule from "yaml";
import ExpressionGraph from "../common/ExpressionGraph.js";
import TextWithContents from "../common/TextWithContents.js";
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
  let contents;
  return new TextWithContents(input, async () => {
    if (contents === undefined) {
      contents = parseYaml(String(input));
      if (isGraphable(contents)) {
        contents = new (FileTreeTransform(ExpressionGraph))(contents);
      }
    }
    return contents;
  });
}
