import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @this {ProgramContext}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 * @returns {Promise<Explorable>}
 */
export default async function shallowMap(variant, mapFn) {
  const context = this;
  const graph = ExplorableGraph.from(variant);
  const fn =
    typeof mapFn === "function"
      ? mapFn
      : typeof mapFn.toFunction === "function"
      ? mapFn.toFunction()
      : ExplorableGraph.toFunction(mapFn);
  return {
    async *[Symbol.asyncIterator]() {
      yield* graph;
    },

    async get(key) {
      let value = await graph.get(key);
      return value !== undefined
        ? fn.call(context, value, key) // Return mapped value
        : undefined;
    },
  };
}

shallowMap.usage = `shallowMap(graph, fn)\tMap the top-level values in a graph`;
