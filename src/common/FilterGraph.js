import ExplorableGraph from "../core/ExplorableGraph.js";

export default class FilterGraph {
  constructor(graph, filter) {
    this.graph = ExplorableGraph.from(graph);
    this.filter = ExplorableGraph.from(filter);
  }

  async *[Symbol.asyncIterator]() {
    const keys = new Set();

    // Yield all keys in the graph that can be found in the filter graph.
    for await (const key of this.graph) {
      const filterValue = await this.filter.get(key);
      const filterValueExplorable = ExplorableGraph.isExplorable(filterValue);
      // If the filter value is explorable, the corresponding value in the graph
      // must be explorable too.
      const match =
        (!filterValueExplorable && filterValue) ||
        (filterValueExplorable &&
          (await ExplorableGraph.isKeyExplorable(this.graph, key)));
      if (match && !keys.has(key)) {
        keys.add(key);
        yield key;
      }
    }

    // Also yield any keys in the filter that are found in the graph. This lets
    // the filter "pull" values from a graph that, e.g., is defined by a
    // function without an explicit domain.
    for await (const key of this.filter) {
      const value = await this.graph.get(key);
      if (value !== undefined && !keys.has(key)) {
        keys.add(key);
        yield key;
      }
    }
  }

  async get(key) {
    let value = await this.graph.get(key);

    let filterValue = await this.filter.get(key);
    if (!ExplorableGraph.isExplorable(value)) {
      if (filterValue === undefined) {
        value = undefined;
      } else if (ExplorableGraph.isExplorable(filterValue)) {
        value = undefined;
      }
    } else if (ExplorableGraph.isExplorable(filterValue)) {
      // Wrap value with corresponding filter.
      value = Reflect.construct(this.constructor, [value, filterValue]);
    }

    return value;
  }
}
