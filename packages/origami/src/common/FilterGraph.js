import { GraphHelpers } from "@graphorigami/core";
import ExplorableGraph from "../core/ExplorableGraph.js";

export default class FilterGraph {
  constructor(graph, filter) {
    this.graph = GraphHelpers.from(graph);
    this.filter = GraphHelpers.from(filter);
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

  async keys() {
    const keys = new Set();

    // Enumerate all keys in the graph that can be found in the filter graph.
    for (const key of await this.graph.keys()) {
      const filterValue = await this.filter.get(key);
      const filterValueExplorable = ExplorableGraph.isExplorable(filterValue);
      // If the filter value is explorable, the corresponding value in the graph
      // must be explorable too.
      const match =
        (!filterValueExplorable && filterValue) ||
        (filterValueExplorable &&
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
