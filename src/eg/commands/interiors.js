import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function interiors(variant = this.graph) {
  const graph = ExplorableGraph.from(variant);
  const interior = {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        const value = await graph.get2(key);
        if (ExplorableGraph.isExplorable(value)) {
          yield key;
        }
      }
    },

    async get2(key) {
      const value = await graph.get2(key);
      return ExplorableGraph.isExplorable(value) ? interiors(value) : undefined;
    },
  };
  return interior;
}

interiors.usage = `interiors([graph])\tReturn the interior nodes of the graph`;
