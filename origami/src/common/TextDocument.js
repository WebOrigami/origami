import { isStringLike, symbols } from "@weborigami/async-tree";
import { toYaml } from "./serialize.js";
import * as utilities from "./utilities.js";

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
   * @typedef {import("@weborigami/types").AsyncTree|null} AsyncTree
   *
   * @param {any} [data]
   * @param {AsyncTree} [parent]
   */
  constructor(data, parent) {
    Object.assign(this, data);
    if (parent) {
      this[symbols.parent] = parent;
    }
  }

  static from(input, parent) {
    if (input["@text"]) {
      return input;
    } else if (isStringLike(input)) {
      const text = utilities.toString(input);
      return new TextDocument({ "@text": text }, parent);
    }
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
