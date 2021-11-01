import ExplorableGraph from "./ExplorableGraph.js";

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
    let value = this.array[key];

    if (rest.length > 0 && ExplorableGraph.canCastToExplorable(value)) {
      value = await ExplorableGraph.from(value).get(...rest);
    }
    if (value instanceof Array && !(value instanceof this.constructor)) {
      value = Reflect.construct(this.constructor, [value]);
    }

    return value;
  }
}
