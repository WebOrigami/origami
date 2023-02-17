import ExplorableGraph from "../core/ExplorableGraph.js";

export default function exceptions(variant) {
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
