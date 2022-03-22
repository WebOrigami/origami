export default function IdentityGraph(graph) {
  return {
    async *[Symbol.asyncIterator]() {
      yield* graph;
    },

    async get(key) {
      return graph.get(key);
    },
  };
}
