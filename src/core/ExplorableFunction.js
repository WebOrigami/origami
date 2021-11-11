import { constructSubgraph } from "./utilities.js";

export default class ExplorableFunction {
  constructor(fn, keys = []) {
    this.fn = fn;
    this.keys = keys;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.keys;
  }

  async get(...keys) {
    if (keys.length === 0) {
      return this;
    }

    let value = await this.fn(...keys);

    if (value instanceof Function && !(value instanceof this.constructor)) {
      value = constructSubgraph(this.constructor, { fn: value, keys: [] });
    }

    return value;
  }
}
