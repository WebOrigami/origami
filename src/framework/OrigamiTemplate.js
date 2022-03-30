import execute from "../language/execute.js";
import * as parse from "../language/parse.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  async compile() {
    const parsed = await parse.templateDocument(this.text);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami template`);
    }
    const code = parsed.value;
    return async (scope) => {
      const result = await execute.call(scope, code);
      return result;
    };
  }
}
