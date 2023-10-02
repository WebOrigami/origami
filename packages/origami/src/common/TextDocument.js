/**
 * A text document whose contents can be interpreted as data.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 * @typedef {import("../../index.js").StringLike} StringLike
 */
export default class TextDocument {
  /**
   * @param {StringLike} bodyText
   * @param {{ parent?: AsyncDictionary|null, contents?: any }} [options]
   */
  constructor(bodyText, options = {}) {
    this.bodyText = String(bodyText);
    this.parent = options.parent;
    this._contents = options.contents;
  }

  async contents() {
    if (!this._contents) {
      return this.bodyText;
    } else if (typeof this._contents === "function") {
      return this._contents();
    } else {
      return this._contents;
    }
  }

  toString() {
    return this.bodyText;
  }
}
