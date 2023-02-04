import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Reverse the order of the top-level keys in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function reverse(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const reversed = {
    async *[Symbol.asyncIterator]() {
      const keys = await ExplorableGraph.keys(graph);
      keys.reverse();
      yield* keys;
    },

    async get(key) {
      const value = await graph.get(key);
      return ExplorableGraph.isExplorable(value)
        ? reverse.call(this.scope, value)
        : value;
    },
  };
  const result = transformObject(InheritScopeTransform, reversed);
  result.parent = this;
  return result;
}

reverse.usage = `reverse <graph>\tReverses the order of the graph's top-level keys`;
reverse.documentation = "https://graphorigami.org/cli/builtins.html#reverse";
