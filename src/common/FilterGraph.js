import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { transformObject } from "../core/utilities.js";
import { isFormulasTransformApplied } from "../framework/FormulasTransform.js";
import MetaTransform from "../framework/MetaTransform.js";

export default class FilterGraph {
  constructor(graph, filter) {
    this.graph = ExplorableGraph.from(graph);

    filter = ExplorableGraph.from(filter);
    if (!isFormulasTransformApplied(filter)) {
      filter = transformObject(MetaTransform, filter);
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
    // Filter does not apply when graph is in scope.
    if (this.isInScope) {
      return this.graph.get(key);
    }

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
    // out. It's possible that the filter has subkeys with explicit true/false
    // values and/or it inherits formulas that might apply to the value we're
    // returning.
    const isFilterValueExplorable = await ExplorableGraph.isExplorable(
      filterValue
    );
    let subfilter;
    if (isFilterValueExplorable) {
      subfilter = filterValue;
    } else {
      // Create an empty graph that inherits from this filter so that it picks
      // up any inheritable formulas.
      subfilter = new (MetaTransform(ObjectGraph))({});
      subfilter.parent = this.filter;
    }
    return Reflect.construct(this.constructor, [value, subfilter]);
  }
}
