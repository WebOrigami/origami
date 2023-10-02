/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import TextFile from "../common/TextFile.js";

/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadJson(container, input, key) {
  let contents;
  return new TextFile(input, async () => {
    if (contents === undefined) {
      contents = JSON.parse(String(input));
    }
    return contents;
  });
}
