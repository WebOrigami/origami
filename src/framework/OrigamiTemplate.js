import execute from "../language/execute.js";
import * as parse from "../language/parse.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  constructor(document, scope) {
    super(document, scope);
    this.code = null;
  }

  async compile() {
    const parsed = await parse.templateDocument(this.templateText);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami template`);
    }
    this.code = parsed.value;
    return async (scope) => {
      const result = await execute.call(scope, this.code);
      return result;
    };
  }
}
