import {
  parseDocumentWithFrontMatter,
  renderDocumentWithFrontMatter,
} from "./serialize.js";

/**
 * A text document with optional associated data.
 *
 * A text document can be serialized into a text with front matter.
 *
 * @typedef {import("../..").JsonValue} JsonValue
 * @typedef {import("../..").StringLike} StringLike
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */
export default class TextDocument2 {
  /**
   * @param {StringLike} text
   * @param {any} [data]
   * @param {AsyncDictionary|null} [parent]
   */
  constructor(text, data, parent) {
    this.text = String(text);
    this.parent = parent;
    this.data = data;
  }

  async contents() {
    return this.data ?? this.text;
  }

  /**
   * Return a new TextDocument for the given input.
   *
   * If the input is already a TextDocument, a new copy will be returned. If the
   * input is string-like, it will be used as the text for a new TextDocument.
   * This process will parse out any front matter and attach it to the document
   * as data.
   *
   * @param {StringLike|TextDocument2} input
   */
  static from(input) {
    if (input instanceof this) {
      return new this(input.text, input.data, input.parent);
    } else {
      const { data, text } = parseDocumentWithFrontMatter(String(input));
      return new this(text, data);
    }
  }

  async serialize() {
    return renderDocumentWithFrontMatter(this.text, this.data);
  }

  toString() {
    return this.text;
  }
}
