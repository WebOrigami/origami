import FrontMatterDocument from "./FrontMatterDocument.js";
import TextDocument from "./TextDocument.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../../index.js").StringLike} StringLike
 *
 * @param {StringLike} input
 * @param {{ parent?: AsyncDictionary|null }} [options]
 */
export function createTextDocument(input, options = {}) {
  const parent = options.parent;
  if (input instanceof TextDocument) {
    return input;
  } else if (typeof (/** @type {any} */ (input).contents) === "function") {
    return new TextDocument(input, {
      contents: /** @type {any} */ (input).contents,
      parent,
    });
  } else {
    return new FrontMatterDocument(input, { parent });
  }
}
