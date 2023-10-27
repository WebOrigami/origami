import TextDocument from "../../common/TextDocument.js";

/**
 * Load a file as text document with possible front matter.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default function unpackText(input, options = {}) {
  const document = TextDocument.from(input);
  document.parent = options.parent;
  return document;
}
