import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default function exceptions(variant) {
  assertScopeIsDefined(this);
  return new ExceptionsGraph(variant);
}

class ExceptionsGraph {
  constructor(variant) {
    this.graph = ExplorableGraph.from(variant);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  async get(key) {
    try {
      const value = await this.graph.get(key);
      return ExplorableGraph.isExplorable(value)
        ? Reflect.construct(this.constructor, [value])
        : undefined;
    } catch (error) {
      return error.name && error.message
        ? `${error.name}: ${error.message}`
        : error.name ?? error.message ?? error;
    }
  }
}
