import { Dictionary, Graph } from "@graphorigami/core";
import { getScope, transformObject } from "../../common/utilities.js";
import defaultKeysJson from "../../framework/defaultKeysJson.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import index from "../@index.js";

/**
 * Expose common static keys (index.html, .keys.json) for a graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 */
export default async function staticGraph(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const result = transformObject(StaticTransform, graph);
  return result;
}

function StaticTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === "index.html") {
        value = index.call(this, this);
      } else if (value === undefined && key === ".keys.json") {
        const scope = getScope(this);
        value = defaultKeysJson.call(scope, this);
      } else if (Dictionary.isAsyncDictionary(value)) {
        value = transformObject(StaticTransform, value);
      }
      return value;
    }

    async keys() {
      const keys = new Set(await super.keys());
      keys.add("index.html");
      keys.add(".keys.json");
      return keys;
    }
  };
}

staticGraph.usage = `static <graph>\tAdd keys for generating common static files`;
staticGraph.documentation = "https://graphorigami.org/cli/builtins.html#static";
