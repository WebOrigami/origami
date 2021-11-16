import ExplorableGraph from "./ExplorableGraph.js";
import { constructSubgraph } from "./utilities.js";

export default class ExplorableFunction {
  constructor(fn, keys = []) {
    this.fn = fn;
    this.keys = keys;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.keys;
  }

  async get2(key) {
    let value = this.fn.length === 1 ? this.fn(key) : this.fn.bind(this, key);
    if (value instanceof Function && !(value instanceof this.constructor)) {
      value = constructSubgraph(this.constructor, { fn: value, keys: [] });
    }
    return value;
  }
  async get(...keys) {
    return await ExplorableGraph.get(this, ...keys);
  }
}
