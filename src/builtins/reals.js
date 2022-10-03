import ExplorableGraph from "../core/ExplorableGraph.js";
import meta from "./meta.js";

/**
 * Return only the real keys in the graph, removing virtual keys implied by
 * formulas.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function reals(variant) {
  const graph = await meta.call(this, variant);
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
reals.documentation = "https://graphorigami.org/cli/builtins.html#reals";
