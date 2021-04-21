import ExplorableGraph from "./ExplorableGraph.js";
import ExplorableObject from "./ExplorableObject.js";

/**
 * Given a set of explorable functions, the [asyncGet] method will look at each
 * exfn in turn. The first exfn is asked for object with the key. If an exfn
 * returns a defined value (i.e., not undefined), that value is returned. If the
 * first exfn returns undefined, the second exfn will be asked, and so on.
 */
export default class Compose extends ExplorableGraph {
  constructor(...graphs) {
    super();
    this.graphs = graphs.map((graph) =>
      graph instanceof ExplorableGraph ? graph : new ExplorableObject(graph)
    );
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
