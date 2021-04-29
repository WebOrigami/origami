import ExplorableGraph from "./ExplorableGraph.js";

export default class FunctionGraph extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = new ExplorableGraph(inner);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.inner[Symbol.asyncIterator]();
  }

  async get(...keys) {
    const value = await this.inner.get(...keys);
    const result = value instanceof Function ? await value() : value;
    return result;
  }
}
