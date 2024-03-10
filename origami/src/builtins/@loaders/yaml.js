import * as YAMLModule from "yaml";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import { evaluateYaml } from "../../common/serialize.js";
import * as utilities from "../../common/utilities.js";

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
  const yaml = utilities.toString(input);
  if (!yaml) {
    throw new Error("Tried to parse something as YAML but it wasn't text.");
  }
  const data = await evaluateYaml(yaml, options.parent);
  return processUnpackedContent(data, parent);
}
