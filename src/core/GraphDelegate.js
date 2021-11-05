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
    if (ExplorableGraph.isExplorable(value)) {
      return Reflect.construct(this.constructor, [value]);
    }
  }
}
