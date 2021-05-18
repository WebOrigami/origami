import ExplorableGraph from "../core/ExplorableGraph.js";
import { explore } from "../core/utilities.js";

/**
 * Given a set of explorable graphs, the get method will look at each graph in
 * turn. The first graph is asked for object with the key. If an graph returns a
 * defined value (i.e., not undefined), that value is returned. If the first
 * graph returns undefined, the second graph will be asked, and so on.
 */
export default class Compose extends ExplorableGraph {
  constructor(...graphs) {
    super();
    this.graphs = graphs.map((graph) => explore(graph));
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

  async get(...keys) {
    for (const graph of this.graphs) {
      const obj = await graph.get(...keys);
      if (obj !== undefined) {
        return obj;
      }
    }
    return undefined;
  }
}
