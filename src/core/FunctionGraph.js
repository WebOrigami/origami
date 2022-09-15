import ExplorableGraph from "./ExplorableGraph.js";
import { isClass } from "./utilities.js";

/**
 * An explorable graph based on a function and an optional domain.
 */
export default class FunctionGraph {
  /**
   * @param {any} fn the function to be explored
   * @param {AsyncIterable|Iterable} [domain] optional domain of the function
   */
  constructor(fn, domain = []) {
    this.fn = fn;
    this.isFnClass = isClass(fn);
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
    let value;
    if ((key === undefined && this.fn.length === 0) || this.fn.length === 1) {
      // No key was provided, or function takes only one argument.
      value = this.isFnClass ? new this.fn(key) : this.fn(key);
    } else {
      // Bind the key to the first parameter. Subsequent get calls will
      // eventually bind all parameters until only one remains. At that point,
      // the above condition will apply and the function will be invoked.
      value = Reflect.construct(this.constructor, [this.fn.bind(this, key)]);
    }
    return value;
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
    let value = this.isFnClass
      ? new this.fn(...args)
      : await this.fn.call(this, ...args);
    if (rest) {
      value = await ExplorableGraph.traverse(value, ...rest);
    }
    return value;
  }
}
