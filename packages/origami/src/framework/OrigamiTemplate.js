import * as compile from "../language/compile.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  async compile() {
    return compile.templateDocument(this.text);
  }
}
