/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import TextWithContents from "../common/TextWithContents.js";
import { isPlainObject, keySymbol } from "../common/utilities.js";

/**
 * Load a file as JSON.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("../..").HasString} HasString
 *
 * @param {AsyncDictionary|null} container
 * @param {string|HasString|Graphable} input
 * @param {any} [key]
 */
export default function loadJson(container, input, key) {
  // See notes at yaml.js
  if (Graph.isGraphable(input)) {
    return input;
  }

  return new TextWithContents(input, async () => {
    const data = JSON.parse(String(input));
    // Add diagnostic information.
    if (data && typeof data === "object" && !isPlainObject(data)) {
      data[keySymbol] = key;
    }
    return data;
  });
}
