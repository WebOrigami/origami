export default class TextWithContents extends String {
  constructor(string, contents) {
    super(string);
    this.contents = typeof contents === "function" ? contents : () => contents;
  }
}
