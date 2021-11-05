import ExplorableGraph from "./ExplorableGraph.js";

export default class GraphDelegate {
  constructor(graph) {
    this.graph = graph;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  async get(...keys) {
    const value = await this.graph.get(...keys);
    return ExplorableGraph.isExplorable(value)
      ? Reflect.construct(this.constructor, [value])
      : value;
  }

  async set(...args) {
    return this.graph.set(...args);
  }
}
