import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function structure(variant = this.graph) {
  const graph = ExplorableGraph.from(variant);
  const interior = {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        const value = await graph.get(key);
        if (ExplorableGraph.isExplorable(value)) {
          yield key;
        }
      }
    },

    async get(...keys) {
      const value = await graph.get(...keys);
      return ExplorableGraph.isExplorable(value) ? structure(value) : undefined;
    },
  };
  return interior;
}

structure.usage = `structure([graph])\tReturn the interior nodes of the graph`;
