import TextDocument from "./TextDocument.js";

/**
 * Load a file as text with possible front matter.
 *
 * If the text starts with `---`, the loader attempts to parse the front matter.
 * If successful, the document will be returned as a String with an attached
 * graph with the front matter and document text as `contents`.
 *
 * If the input is not a string or Buffer, or already has `contents`, it is
 * returned as is.
 *
 * @type {import("../../index.js").Deserializer}
 */
export default function loadTextWithFrontMatter(container, input) {
  const document = TextDocument.from(input);
  document.parent = container;
  return document;
}
