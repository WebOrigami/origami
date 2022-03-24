import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import execute from "../language/execute.js";
import * as parse from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import { defineAmbientProperties } from "./scopeUtilities.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  async compile() {
    const parsed = await parse.templateDocument(this.template);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami template`);
    }
    const code = parsed.value;

    return async (data, graph) => {
      let base;
      if (!data) {
        // Use graph as is.
        base = graph;
      } else if (typeof data === "function") {
        // Evaluate data function. A common scenario for this would be a
        // template like foo.ori being called as a block:
        // {{#foo.ori}}...{{/foo.ori}}. The inner contents of the block will
        // be a lambda, i.e., a function that we want to invoke.
        data = await data.call(graph);
        base = graph;
      } else {
        // Extend graph with data.
        base = ExplorableGraph.from(data);
        const parent = /** @type {any} */ (base).parent;
        if (parent === undefined) {
          if (!("parent" in base)) {
            base = transformObject(InheritScopeTransform, base);
          }
          base.parent = graph;
        }
      }

      // Add the data as a @value ambient.
      const withAmbients = defineAmbientProperties(base, {
        "@value": data,
      });

      const result = await execute.call(withAmbients, code);
      return result;
    };
  }
}
