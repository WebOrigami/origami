import * as YAMLModule from "yaml";
import { processUnpackedContent } from "../common/processUnpackedContent.js";
import { parseYaml } from "../common/serialize.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @type {import("../..").FileUnpackFunction}
 */
export default function unpackYaml(input, options = {}) {
  const parent = options.parent ?? null;
  const content = parseYaml(String(input));
  return processUnpackedContent(content, parent);
}
