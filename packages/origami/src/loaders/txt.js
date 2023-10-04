import TextDocument from "../common/TextDocument.js";

/**
 * Load a file as text document with possible front matter.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackText(container, input) {
  const document = TextDocument.from(input);
  document.parent = container;
  return document;
}
