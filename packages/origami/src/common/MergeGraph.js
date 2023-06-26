import { GraphHelpers } from "@graphorigami/core";

/**
 * Return a graph that performs a shallow merge of the given graphs.
 *
 * Given a set of graphs, the `get` method looks at each graph in turn. The
 * first graph is asked for the value with the key. If an graph returns a
 * defined value (i.e., not undefined), that value is returned. If the first
 * graph returns undefined, the second graph will be asked, and so on. If none
 * of the graphs return a defined value, the `get` method returns undefined.
 */
export default class MergeGraph {
  constructor(...graphs) {
    this.graphs = graphs.map((graph) => GraphHelpers.from(graph));
  }

  async get(key) {
    for (const graph of this.graphs) {
      const value = await graph.get(key);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  async keys() {
    const keys = new Set();
    for (const graph of this.graphs) {
      for (const key of await graph.keys()) {
        keys.add(key);
      }
    }
    return keys;
  }
}
