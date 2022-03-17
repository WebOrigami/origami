import ExplorableGraph from "../core/ExplorableGraph.js";
import Formula from "../framework/Formula.js";

/**
 * Return only the results (non-formulas) in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function results(variant) {
  const graph = variant ? ExplorableGraph.from(variant) : this;
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
  };
}

results.usage = `results <graph>\tOnly results (non-formulas) in the graph`;
results.documentation = "https://explorablegraph.org/cli/builtins.html#results";
