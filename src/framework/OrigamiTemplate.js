import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import execute from "../language/execute.js";
import * as parse from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import Template from "./Template.js";

export default class OrigamiTemplate extends Template {
  async compile() {
    const parsed = await parse.templateDocument(this.template);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami template`);
    }
    const code = parsed.value;

    return async (data, graph) => {
      let extended;
      if (!data) {
        // Use graph as is.
        extended = graph;
      } else {
        // Extend graph with data (if present).
        extended = ExplorableGraph.from(data);
        const parent = /** @type {any} */ (extended).parent;
        if (parent === undefined) {
          if (!("parent" in extended)) {
            extended = transformObject(InheritScopeTransform, extended);
          }
          extended.parent = graph;
        }
      }

      return execute.call(extended, code);
    };
  }
}