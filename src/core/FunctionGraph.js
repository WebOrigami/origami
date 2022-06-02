/**
 * An explorable graph based on a function and an optional domain.
 */
export default class FunctionGraph {
  /**
   * @param {function} fn the function to be explored
   * @param {AsyncIterable|Iterable} [domain] optional domain of the function
   */
  constructor(fn, domain = []) {
    this.fn = fn;
    this.domain = domain;
  }

  /**
   * Yields the function's domain (if defined) as the graph's keys. If no domain
   * was defined, this returns an empty iterable.
   */
  async *[Symbol.asyncIterator]() {
    yield* this.domain;
  }

  /**
   * Return the application of the function to the given key.
   *
   * @param {any} key
   */
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
