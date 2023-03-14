import ExplorableGraph from "./ExplorableGraph.js";

/**
 * An explorable graph based on a function and an optional domain.
 */
export default class FunctionGraph {
  /**
   * @param {function} fn the function to be explored
   * @param {Iterable} [domain] optional domain of the function
   */
  constructor(fn, domain = []) {
    this.fn = fn;
    this.domain = domain;
  }

  /**
   * Return the application of the function to the given key.
   *
   * @param {any} key
   */
  async get(key) {
    let value =
      (key === undefined && this.fn.length === 0) || this.fn.length === 1
        ? // No key was provided, or function takes only one argument: invoke
          this.fn(key)
        : // Bind the key to the first parameter. Subsequent get calls will
          // eventually bind all parameters until only one remains. At that point,
          // the above condition will apply and the function will be invoked.
          Reflect.construct(this.constructor, [this.fn.bind(this, key)]);
    return value;
  }

  /**
   * Enumerates the function's domain (if defined) as the graph's keys. If no domain
   * was defined, this returns an empty iterable.
   */
  async keys() {
    return this.domain;
  }

  /**
   * Apply the function to the given keys as arguments.
   */
  async traverse(...keys) {
    let args;
    let rest;
    if (this.fn.length > 0 && keys.length > this.fn.length) {
      args = keys.slice(0, this.fn.length);
      rest = keys.slice(this.fn.length);
    } else {
      args = keys;
      rest = null;
    }
    let value = await this.fn.call(null, ...args);
    if (rest) {
      value = await ExplorableGraph.traverse(value, ...rest);
    }
    return value;
  }
}
