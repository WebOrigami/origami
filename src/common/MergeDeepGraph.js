import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * This is a variation of MergeGraph that performs a deep merge.
 *
 * Given a set of explorable graphs, the get method will look at each graph in
 * turn. The first graph is asked for object with the key. If an graph returns a
 * defined value (i.e., not undefined), that value is returned. If the first
 * graph returns undefined, the second graph will be asked, and so on.
 */
export default class MergeDeepGraph {
  constructor(...graphs) {
    this.graphs = graphs.map((graph) => ExplorableGraph.from(graph));
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (!set.has(key)) {
          set.add(key);
          yield key;
        }
      }
    }
  }

  async get(key) {
    const explorableSubvalues = [];

    for (const graph of this.graphs) {
      const value = await graph.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        explorableSubvalues.push(value);
      } else if (value !== undefined) {
        return value;
      }
    }

    return explorableSubvalues.length > 0
      ? new MergeDeepGraph(...explorableSubvalues)
      : undefined;
  }
}
