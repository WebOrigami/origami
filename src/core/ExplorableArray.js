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

  async get(key) {
    let value = this.array[Number(key)];
    if (value instanceof Array && !(value instanceof this.constructor)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }
}
