import TextDocument from "../common/TextDocument.js";

/**
 * Load a file as text document with possible front matter.
 *
 * @type {import("../..").FileUnpackFunction}
 */
export default function unpackText(input, options = {}) {
  const document = TextDocument.from(input);
  document.parent2 = options.parent;
  return document;
}
