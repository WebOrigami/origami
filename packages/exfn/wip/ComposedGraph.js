import Graph from "./Graph.js";

export default class ComposedGraph extends Graph {
  constructor(...graphs) {
    super();
    this.graphs = graphs.map((graph) => Graph.from(graph));
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    for (const graph of this.graphs) {
      for await (const key of graph) {
        set.add(key);
      }
    }
    yield* set;
  }

  async get(key) {
    const matches = [];
    for (const graph of this.graphs) {
      const obj = await graph.get(key);
      if (obj !== undefined) {
        matches.push(obj);
      }
    }
    if (matches.length === 0) {
      // Not found
      return undefined;
    } else if (matches.length === 1) {
      // Return the only result.
      return matches[0];
    } else {
      const graphMatches = matches.filter((match) => match instanceof Graph);
      if (matches.length === graphMatches.length) {
        // All matches are graphs; compose them.
        return Graph.compose(...matches);
      } else {
        // Can't compose a mixture of graphs and non-graphs.
        // Return just the first result.
        return matches[0];
      }
    }
  }
}
