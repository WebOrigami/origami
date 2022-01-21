export default class ExplorableFunction {
  constructor(fn, domain = []) {
    this.fn = fn;
    this.domain = domain;
  }

  // Yield the function's domain as its keys.
  async *[Symbol.asyncIterator]() {
    yield* this.domain;
  }

  // Return the value for a given key.
  async get(key) {
    let value =
      key === undefined || this.fn.length === 1
        ? // No key was provided, or function takes only one argument: invoke
          this.fn(key)
        : // Bind the key to the first parameter. Subsequent get calls will
          // eventually bind all parameters until only one remains. At that point,
          // the above condition will apply and the function will be invoked.
          this.fn.bind(this, key);
    return value;
  }
}
