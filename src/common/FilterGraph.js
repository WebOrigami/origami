import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { transformObject } from "../core/utilities.js";
import Formula from "../framework/Formula.js";
import { isFormulasTransformApplied } from "../framework/FormulasTransform.js";
import KeysTransform from "../framework/KeysTransform.js";
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
    // Yield all real keys in filter that aren't formulas.
    const filterKeys = await KeysTransform.realKeys(this.filter);
    const filtered = filterKeys.filter((key) => !Formula.isFormula(key));
    const keys = new Set(...filtered);
    yield* filtered;

    // Yield all keys in graph that aren't in filter's public keys
    // but are matched by wildcards in the filter..
    for await (const graphKey of this.graph) {
      if (!keys.has(graphKey)) {
        const matches =
          (await ExplorableGraph.isKeyExplorable(this.graph, graphKey)) ||
          (await this.filter.get(graphKey));
        if (matches !== undefined) {
          keys.add(graphKey);
          yield graphKey;
        }
      }
    }
  }

  async get(key) {
    let value = await this.graph.get(key);

    // The filter only applies when graph is not in scope.
    if (!(/** @type {any} */ (this).isInScope)) {
      let filterValue = await this.filter.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        // It's possible that the filter has subkeys and/or it inherits formulas
        // that might apply to the value we're returning.
        if (!ExplorableGraph.isExplorable(filterValue)) {
          // Create an empty graph that inherits from this filter so that it
          // picks up any inheritable formulas.
          filterValue = new (MetaTransform(ObjectGraph))({});
          filterValue.parent = this.filter;
        }
        value = Reflect.construct(this.constructor, [value, filterValue]);
      } else if (filterValue === undefined) {
        // Didn't match filter
        value = undefined;
      }
    }

    return value;
  }
}
