import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import FormulaTransform from "../framework/FormulasTransform.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

export default class FilterGraph {
  constructor(graph, filter) {
    this.graph = ExplorableGraph.from(graph);

    // Apply the FormulaTransform and InheritScopeTransforms to the filter if
    // they're not already applied.
    filter = ExplorableGraph.from(filter);
    if (!("formulas" in filter)) {
      filter = transformObject(FormulaTransform, filter);
    }
    if (!("scope" in filter)) {
      filter = transformObject(InheritScopeTransform, filter);
    }

    this.filter = filter;
  }

  async *[Symbol.asyncIterator]() {
    for await (const key of this.graph) {
      const matches = await this.match(key);
      if (matches) {
        yield key;
      }
    }
  }

  async get(key) {
    const matches = await this.match(key);
    if (!matches) {
      return false;
    }

    let value = await this.graph.get(key);

    if (ExplorableGraph.isExplorable(value)) {
      // Get the corresponding portion of the filter and return a new FilterGraph
      let filter = await this.filter.get(key);
      if (filter === undefined) {
        // If the filter doesn't contain the key, it's possible that the filter
        // nevertheless has inheritable formulas that might apply to the value
        // we're returning.
        filter = await inheritFormulas(this.filter);
      }
      return filter
        ? Reflect.construct(this.constructor, [value, filter])
        : undefined;
    }

    return value;
  }

  async match(key) {
    const filterValue = await this.filter.get(key);
    if (filterValue !== undefined) {
      // Explicitly filtered
      return !!filterValue;
    }

    // If filter value is undefined, return true if the key is explorable.
    const explorable = await ExplorableGraph.isKeyExplorable(this.graph, key);
    return explorable;
  }
}

// Return a copy of the filter's inheritable formulas. If none are found, return
// null.
async function inheritFormulas(filter) {
  const formulas = {};
  for await (const key of filter) {
    // HACK: for now we just inspect the key to see if it starts with "…". It
    // would be better if we could get the parsed inheritable formulas from the
    // filter object itself.
    if (key.startsWith("…")) {
      formulas[key] = await filter.get(key);
    }
  }
  return Object.keys(formulas).length ? formulas : null;
}
