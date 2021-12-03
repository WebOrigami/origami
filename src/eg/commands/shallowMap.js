import ExplorableGraph from "../../core/ExplorableGraph.js";
import * as utilities from "../../core/utilities.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 * @returns {Promise<Explorable>}
 */
export default async function shallowMap(variant, mapFn) {
  const graph = ExplorableGraph.from(variant);
  const fn = utilities.toFunction(mapFn);
  return {
    async *[Symbol.asyncIterator]() {
      yield* graph;
    },

    async get(key) {
      let value = await graph.get(key);
      return value !== undefined
        ? await fn.call(this, value, key) // Return mapped value
        : undefined;
    },
  };
}

shallowMap.usage = `shallowMap(graph, fn)\tMap the top-level values in a graph`;
