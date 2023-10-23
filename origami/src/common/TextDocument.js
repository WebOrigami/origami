import { parseYaml, toYaml } from "./serialize.js";

/**
 * A text document with optional associated data.
 *
 * @typedef {import("../../index.js").JsonValue} JsonValue
 * @typedef {import("../../index.js").StringLike} StringLike
 * @typedef {import("@graphorigami/core").Unpackable} HasContents
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */
export default class TextDocument {
  /**
   * @param {StringLike} text
   * @param {any} [data]
   * @param {AsyncDictionary|null} [parent]
   */
  constructor(text, data, parent) {
    this.text = String(text);
    this.data = data;
    this._parent = parent;
    if (data && parent && "parent2" in data) {
      data.parent2 = parent;
    }
  }

  /**
   * Return a new TextDocument for the given input.
   *
   * If the input is already a TextDocument, a new copy will be returned.
   *
   * If the input is string-like, it will be used as the text for a new
   * TextDocument. This process will parse out any YAML or JSON front matter and
   * attach it to the document as data. The first line of the text must be
   * "---", followed by a block of JSON or YAML, followed by another line of
   * "---". Any lines following will be treated as the document text.
   *
   * @param {StringLike|TextDocument} input
   */
  static from(input) {
    if (input instanceof this) {
      return new this(input.text, input.data, input.parent2);
    }

    const text = String(input);
    const regex =
      /^(?<frontBlock>---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<bodyText>[\s\S]*$)/;
    const match = regex.exec(text);
    if (match?.groups) {
      const data = parseYaml(match.groups.frontText);
      return new this(match.groups.bodyText, data);
    } else {
      return new this(text);
    }
  }

  /**
   * Render the text and data as a document with YAML front matter.
   */
  async pack() {
    if (this.data) {
      const frontMatter = (await toYaml(this.data)).trimEnd();
      return `---\n${frontMatter}\n---\n${this.text}`;
    } else {
      return this.text;
    }
  }

  get parent2() {
    return this._parent;
  }
  set parent2(parent) {
    this._parent = parent;
    if (this.data && "parent2" in this.data) {
      this.data.parent2 = parent;
    }
  }

  toString() {
    return this.text;
  }

  unpack() {
    return this.data;
  }
}
