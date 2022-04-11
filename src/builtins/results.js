import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import Formula from "../framework/Formula.js";
import { parentScope } from "../framework/scopeUtilities.js";

/**
 * Return only the results (non-formulas) in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function results(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const baseScope = parentScope(this);
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        if (!Formula.isFormula(key)) {
          yield key;
        }
      }
    },

    async get(key) {
      return graph.get(key);
    },

    get scope() {
      return new Scope(this, baseScope);
    },
  };
}

results.usage = `results <graph>\tOnly results (non-formulas) in the graph`;
results.documentation = "https://explorablegraph.org/cli/builtins.html#results";
