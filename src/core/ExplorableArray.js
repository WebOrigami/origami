import ExplorableGraph from "./ExplorableGraph.js";
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

  async get(...keys) {
    if (keys.length === 0) {
      return this;
    }

    const [key, ...rest] = keys;
    let value = this.array[Number(key)];

    if (rest.length > 0 && ExplorableGraph.canCastToExplorable(value)) {
      value = await ExplorableGraph.from(value).get(...rest);
    }
    if (value instanceof Array && !(value instanceof this.constructor)) {
      value = constructSubgraph(this.constructor, { array: value });
    }

    return value;
  }
}
