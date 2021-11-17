import { constructSubgraph } from "./utilities.js";

export default class ExplorableArray {
  /**
   * @param {Array} array
   */
  constructor(array) {
    this.array = array;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.array.keys();
  }

  constructSubgraph(key, dictionary) {
    return constructSubgraph(this.constructor, dictionary);
  }

  async get(key) {
    let value = this.array[Number(key)];
    if (value instanceof Array && !(value instanceof this.constructor)) {
      value = this.constructSubgraph(key, { array: value });
    }
    return value;
  }
}
