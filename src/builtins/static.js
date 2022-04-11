import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { parentScope } from "../framework/scopeUtilities.js";

/**
 * Expose common static keys (index.html, .keys.json) for a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default async function staticGraph(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const baseScope = parentScope(this);
  return {
    async *[Symbol.asyncIterator]() {
      const keys = new Set();
      for await (const key of graph) {
        keys.add(key);
        yield key;
      }
      if (!keys.has("index.html")) {
        yield "index.html";
      }
      if (!keys.has(".keys.json")) {
        yield ".keys.json";
      }
    },

    async get(key) {
      const value = await graph.get(key);
      return ExplorableGraph.isExplorable(value) ? staticGraph(value) : value;
    },

    get scope() {
      return new Scope(this, baseScope);
    },
  };
}

staticGraph.usage = `static <graph>\tAdd keys for generating common static files`;
staticGraph.documentation =
  "https://explorablegraph.org/cli/builtins.html#static";
