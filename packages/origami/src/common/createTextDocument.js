import FrontMatterDocument from "./FrontMatterDocument.js";
import TextDocument from "./TextDocument.js";

/**
 * Given an input object that represents text, return a new TextDocument
 * instance or FrontMatterDocument instance that holds that text and any
 * attached data.
 *
 * The input can be an existing TextDocument or FrontMatterDocument instance, in
 * which case a copy will be returned. Otherwise, the text of the input will be
 * obtained via `toString` and treated as the text of a new FrontMatterDocument
 * instance; this will look for front matter in the text and separate it from
 * the body text as necessary.
 *
 * The `options` parameter can supply a `contents` property that will be used as
 * the contents of the returned document, and a `parent` property that will be
 * used as the parent of the returned document.
 *
 * @typedef {import("../../index.js").StringLike} StringLike
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 *
 * @param {StringLike} input
 * @param {{ frontData?: PlainObject, parent?: AsyncDictionary|null, contents?: any }} [options]
 */
export function createTextDocument(input, options = {}) {
  const contents =
    options.contents ?? /** @type {any} */ (input).contents?.bind(input);
  const parent = options.parent ?? /** @type {any} */ (input).parent;
  const frontData = options.frontData ?? /** @type {any} */ (input).frontData;
  if (frontData) {
    return new FrontMatterDocument(input, {
      contents,
      frontData,
      parent,
    });
  } else if (input instanceof TextDocument) {
    return new TextDocument(input, { contents, parent });
  } else {
    return new FrontMatterDocument(input, { contents, parent });
  }
}
