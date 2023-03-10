import ExplorableGraph from "../core/ExplorableGraph.js";
import { getScope, transformObject } from "../core/utilities.js";
import defaultKeysJson from "../framework/defaultKeysJson.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Expose common static keys (index.html, .keys.json) for a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default async function staticGraph(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const result = transformObject(StaticTransform, graph);
  return result;
}

function StaticTransform(Base) {
  return class Static extends Base {
    async *[Symbol.asyncIterator]() {
      const keys = new Set();
      for await (const key of super[Symbol.asyncIterator]()) {
        keys.add(key);
        yield key;
      }
      // if (!keys.has("index.html")) {
      //   yield "index.html";
      // }
      if (!keys.has(".keys.json")) {
        yield ".keys.json";
      }
    }

    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === ".keys.json") {
        const scope = getScope(this);
        value = defaultKeysJson.call(scope, this);
      } else if (ExplorableGraph.isExplorable(value)) {
        value = transformObject(StaticTransform, value);
      }
      return value;
    }
  };
}

staticGraph.usage = `static <graph>\tAdd keys for generating common static files`;
staticGraph.documentation = "https://graphorigami.org/cli/builtins.html#static";
