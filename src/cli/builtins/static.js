import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Expose common static keys (index.html, .keys.json) for a graph.
 *
 * @param {Explorable} variant
 */
export default async function staticGraph(variant) {
  const graph = ExplorableGraph.from(variant);
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
  };
}

staticGraph.usage = `static <graph>\tAdd keys for generating common static files`;
staticGraph.documentation =
  "https://explorablegraph.org/pika/builtins.html#static";
