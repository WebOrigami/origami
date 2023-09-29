/**
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 * @implements {HasContents}
 */
export default class TextWithContents extends String {
  constructor(string, contents) {
    super(string);
    this.contents = typeof contents === "function" ? contents : () => contents;
  }

  // Helper for inspecting text in the debugger.
  get text() {
    return String(this);
  }
}
