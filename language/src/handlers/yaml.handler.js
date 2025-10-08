import { symbols, toString } from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import processUnpackedContent from "./processUnpackedContent.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
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

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const yaml = toString(packed);
    if (!yaml) {
      throw new Error("Tried to parse something as YAML but it wasn't text.");
    }
    const data = YAML.parse(yaml);
    if (data && typeof data === "object" && Object.isExtensible(data)) {
      Object.defineProperty(data, symbols.deep, {
        enumerable: false,
        value: true,
      });
    }
    return processUnpackedContent(data, parent);
  },
};
