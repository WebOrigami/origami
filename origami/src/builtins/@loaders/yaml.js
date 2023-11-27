import { Tree } from "@graphorigami/async-tree";
import * as YAMLModule from "yaml";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import { parseYaml } from "../../common/serialize.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Load a file as YAML.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackYaml(input, options = {}) {
  const parent = options.parent ?? null;
  let data = parseYaml(String(input));
  if (Tree.isAsyncTree(data)) {
    data.parent = parent;
    data = await Tree.plain(data);
  }
  return processUnpackedContent(data, parent);
}
