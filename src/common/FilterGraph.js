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
      let matches = await this.filter.get(key);
      if (matches === undefined) {
        // If filter doesn't explicitly set true/false, we assume true if the
        // main graph indicates the key is explorable.
        matches = await ExplorableGraph.isKeyExplorable(this.graph, key);
      }
      if (matches) {
        yield key;
      }
    }
  }

  async get(key) {
    const filterValue = await this.filter.get(key);
    if (filterValue === false) {
      // Explicitly filtered out
      return undefined;
    }

    let value = await this.graph.get(key);
    if (filterValue === true) {
      // Explicitly included
      return value;
    }

    if (!ExplorableGraph.isExplorable(value)) {
      // Not explorable, so assume it should be filtered out
      return undefined;
    }

    // At this point, we have an explorable value that isn't explicitly filtered
    // out. It's possible that the filter nevertheless has inheritable formulas
    // that might apply to the value we're returning.
    const inheritedFilter = await inheritFormulas(this.filter);

    if (!inheritedFilter) {
      // No inherited formulas, so anything below this value is implicitly
      // filtered out.
      return undefined;
    }

    // Construct a new FilterGraph for the subvalue and inherited formulas.
    return Reflect.construct(this.constructor, [value, inheritedFilter]);
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
    if (key.startsWith?.("…")) {
      formulas[key] = await filter.get(key);
    }
  }
  return Object.keys(formulas).length ? formulas : null;
}
