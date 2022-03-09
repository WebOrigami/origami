import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the inner nodes of the graph: the nodes with children.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function inners(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const inner = {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        const value = await graph.get(key);
        if (ExplorableGraph.isExplorable(value)) {
          yield key;
        }
      }
    },

    async get(key) {
      const value = await graph.get(key);
      return ExplorableGraph.isExplorable(value) ? inners(value) : undefined;
    },
  };
  return inner;
}

inners.usage = `inners <graph>\tThe inner nodes of the graph`;
inners.documentation = "https://explorablegraph.org/cli/builtins.html#inners";
