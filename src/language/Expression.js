import execute from "./execute.js";

export default class Expression {
  constructor(code) {
    this.code = code;
  }

  async evaluate(scope) {
    return execute.call(scope, this.code);
  }
}
