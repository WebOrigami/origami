/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import TextWithContents from "../common/TextWithContents.js";

/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadJson(container, input, key) {
  let contents;
  return new TextWithContents(input, async () => {
    if (contents === undefined) {
      contents = JSON.parse(String(input));
    }
    return contents;
  });
}
