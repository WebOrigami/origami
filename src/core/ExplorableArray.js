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

  async get2(key) {
    let value = this.array[Number(key)];
    if (value instanceof Array && !(value instanceof this.constructor)) {
      value = constructSubgraph(this.constructor, { array: value });
    }
    return value;
  }
}
