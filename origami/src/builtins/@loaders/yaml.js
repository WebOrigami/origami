import * as YAMLModule from "yaml";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import { evaluateYaml } from "../../common/serialize.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default async function unpackYaml(input, options = {}) {
  const parent = options.parent ?? null;
  const data = await evaluateYaml(String(input), options.parent);
  return processUnpackedContent(data, parent);
}
