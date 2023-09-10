import { DictionaryHelpers, GraphHelpers } from "@graphorigami/core";

export default class FilterGraph {
  constructor(graph, filter) {
    this.graph = GraphHelpers.from(graph);
    this.filter = GraphHelpers.from(filter);
  }

  async get(key) {
    let value = await this.graph.get(key);

    let filterValue = await this.filter.get(key);
    if (!DictionaryHelpers.isAsyncDictionary(value)) {
      if (filterValue === undefined) {
        value = undefined;
      } else if (DictionaryHelpers.isAsyncDictionary(filterValue)) {
        value = undefined;
      }
    } else if (DictionaryHelpers.isAsyncDictionary(filterValue)) {
      // Wrap value with corresponding filter.
      value = Reflect.construct(this.constructor, [value, filterValue]);
    }

    return value;
  }

  async keys() {
    const keys = new Set();

    // Enumerate all keys in the graph that can be found in the filter graph.
    for (const key of await this.graph.keys()) {
      const filterValue = await this.filter.get(key);
      const isFilterValueGraph =
        DictionaryHelpers.isAsyncDictionary(filterValue);
      // If the filter value is a graph, the corresponding value in the graph
      // must be a graph too.
      const match =
        (!isFilterValueGraph && filterValue) ||
        (isFilterValueGraph &&
          (await GraphHelpers.isKeyForSubgraph(this.graph, key)));
      if (match) {
        keys.add(key);
      }
    }

    // Also include any keys in the filter that are found in the graph. This
    // lets the filter "pull" values from a graph that, e.g., is defined by a
    // function without an explicit domain.
    for (const key of await this.filter.keys()) {
      const value = await this.graph.get(key);
      if (value !== undefined) {
        keys.add(key);
      }
    }

    return keys;
  }
}