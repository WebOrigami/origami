/**
 * A dictionary defined by a function and an optional domain.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @implements {AsyncDictionary}
 */
export default class FunctionDictionary {
  /**
   * @param {function} fn the key->value function
   * @param {Iterable<any>} [domain] optional domain of the function
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
    return this.fn(key);
  }

  /**
   * Enumerates the function's domain (if defined) as the graph's keys. If no domain
   * was defined, this returns an empty iterator.
   */
  async keys() {
    return this.domain;
  }
}
