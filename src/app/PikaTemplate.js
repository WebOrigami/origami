import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import execute from "../eg/execute.js";
import * as parse from "../eg/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import Template from "./Template.js";

export default class PikaTemplate extends Template {
  async compile() {
    const parsed = await parse.template(this.text);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse template`);
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
        if (extended.parent === undefined) {
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
