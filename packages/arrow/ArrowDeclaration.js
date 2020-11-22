export default class ArrowDeclaration {
  constructor(str) {
    const arrowRegex = /^\s*(?<target>.+)\s*←\s*\(\s*(?<source>.+)\s*\)\s*\.js$/;
    const match = arrowRegex.exec(str);
    if (!match) {
      throw new SyntaxError(`Invalid ArrowDeclaration: ${str}`);
    }
    this.sourcePattern = match.groups.source;
    this.targetPattern = match.groups.target;
  }

  static isArrowDeclaration(str) {
    return str.includes("←");
  }
}
