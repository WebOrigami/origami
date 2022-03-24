import execute from "../language/execute.js";
import * as parse from "../language/parse.js";
import { defineAmbientProperties, setScope } from "./scopeUtilities.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  async compile() {
    const parsed = await parse.templateDocument(this.template);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami template`);
    }
    const code = parsed.value;

    return async (data, graph) => {
      if (typeof data === "function") {
        // The data is a function that must be evaluated to get the actual data.
        // A common scenario for this would be a template like foo.ori being
        // called as a block: {{#foo.ori}}...{{/foo.ori}}. The inner contents of
        // the block will be a lambda, i.e., a function that we want to invoke.
        data = await data.call(graph);
      }

      // Extend the graph's scope with ambient properties.
      const baseScope = graph?.scope ?? graph;
      const scope = defineAmbientProperties(baseScope, {
        "@input": data,
      });

      const context = data ? setScope(data, scope) : scope;

      const result = await execute.call(context, code);
      return result;
    };
  }
}
