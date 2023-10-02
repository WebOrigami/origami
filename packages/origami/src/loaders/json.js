import TextDocument from "../common/TextDocument.js";

/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadJson(container, input, key) {
  return new TextDocument(input, {
    async contents() {
      return JSON.parse(String(input));
    },
  });
}
