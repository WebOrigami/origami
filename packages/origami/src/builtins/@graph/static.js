import { GraphHelpers } from "@graphorigami/core";
import { getScope, transformObject } from "../../core/utilities.js";
import defaultKeysJson from "../../framework/defaultKeysJson.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import index from "../@index.js";

/**
 * Expose common static keys (index.html, .keys.json) for a graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 */
export default async function staticGraph(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = GraphHelpers.from(variant);
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
      } else if (GraphHelpers.isAsyncDictionary(value)) {
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
