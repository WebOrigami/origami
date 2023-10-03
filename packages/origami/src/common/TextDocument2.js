import { extractFrontMatter, toYaml } from "./serialize.js";

/**
 * A text document with optional associated data.
 *
 * A text document can be serialized into a text with front matter.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 * @typedef {import("../../index.js").StringLike} StringLike
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
      // See if the input has front matter, make graph from it.
      const { bodyText, frontData } = extractFrontMatter(input);
      return new this(bodyText, frontData);
    }
  }

  async serialize() {
    if (this.data) {
      const frontMatter = (await toYaml(this.data)).trimEnd();
      return `---\n${frontMatter}\n---\n${this.text}`;
    } else {
      return this.text;
    }
  }

  toString() {
    return this.text;
  }
}
