export default class ExplorableFunction {
  constructor(fn, keys = []) {
    this.fn = fn;
    this.keys = keys;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.keys;
  }

  async get(...keys) {
    return keys.length === 0 ? this : await this.fn(...keys);
  }
}
