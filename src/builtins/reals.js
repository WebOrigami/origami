import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import FormulasTransform from "../framework/FormulasTransform.js";

/**
 * Return only the real keys in the graph, removing virtual keys implied by
 * formulas.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function reals(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  let graph = ExplorableGraph.from(variant);
  if (!("realKeys" in graph)) {
    graph = transformObject(FormulasTransform, graph);
  }
  return {
    async *[Symbol.asyncIterator]() {
      const realKeys = await /** @type {any} */ (graph).realKeys();
      yield* realKeys;
    },

    async get(key) {
      const realKeys = await /** @type {any} */ (graph).realKeys();
      if (!realKeys.includes(key)) {
        return undefined;
      }
      const value = await graph.get(key);
      return ExplorableGraph.isExplorable(value) ? reals(value) : value;
    },
  };
}

reals.usage = `reals <graph>\tOnly real (non-virtual) portion of the graph`;
reals.documentation = "https://explorablegraph.org/cli/builtins.html#reals";
