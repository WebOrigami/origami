import { symbols } from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import { parseYaml } from "../common/serialize.js";
import * as utilities from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A YAML file
 *
 * Unpacking a YAML file returns the parsed data.
 *
 */
export default {
  mediaType: "application/yaml",

  /** @type {import("@weborigami/language").UnpackFunction} */
  unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const yaml = utilities.toString(packed);
    if (!yaml) {
      throw new Error("Tried to parse something as YAML but it wasn't text.");
    }
    const data = parseYaml(yaml);
    if (data && typeof data === "object" && Object.isExtensible(data)) {
      Object.defineProperty(data, symbols.deep, {
        enumerable: false,
        value: true,
      });
    }
    return processUnpackedContent(data, parent);
  },
};
