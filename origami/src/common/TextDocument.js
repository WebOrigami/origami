import { toYaml } from "./serialize.js";

const parentKey = Symbol("parent");

/**
 * A text document is any object with a `@text` property and a `toString()`
 * method that returns that text. This class is a helper for constructing such
 * text documents.
 */
export default class TextDocument {
  /**
   * The `input` parameter can be anything that can be converted to a string.
   * The optional `data` parameter can be any object; if the object is a plain
   * object, its properties will be copied to the new document; otherwise, that
   * parameter is ignored.
   *
   * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
   * @typedef {import("@graphorigami/types").AsyncTree|null} AsyncTree
   *
   * @param {StringLike} input
   * @param {any} [data]
   * @param {AsyncTree} [parent]
   */
  constructor(input, data, parent) {
    Object.assign(this, data);
    this["@text"] = String(input);
    this[parentKey] = parent;
  }

  getParent() {
    return this[parentKey];
  }

  /**
   * Render the text and data as a document with YAML front matter.
   */
  async pack() {
    const text = this["@text"];
    /** @type {any} */
    const dataWithoutText = Object.assign({}, this);
    delete dataWithoutText["@text"];
    if (Object.keys(dataWithoutText).length > 0) {
      const frontMatter = (await toYaml(dataWithoutText)).trimEnd();
      return `---\n${frontMatter}\n---\n${text}`;
    } else {
      return text;
    }
  }

  toString() {
    return this["@text"];
  }
}
