export default class ExplorableFunction {
  constructor(fn, keys = []) {
    this.fn = fn;
    this.keys = keys;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.keys;
  }

  async get(key) {
    let value =
      key === undefined
        ? this
        : this.fn.length === 1
        ? this.fn(key)
        : this.fn.bind(this, key);
    if (value instanceof Function && !(value instanceof this.constructor)) {
      // We don't know the domain of the explorable function we're returning, so
      // use the empty array.
      const keys = [];
      value = Reflect.construct(this.constructor, [value, keys]);
    }
    return value;
  }
}
