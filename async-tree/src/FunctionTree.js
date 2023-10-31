/**
 * A tree defined by a function and an optional domain.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class FunctionTree {
  /**
   * @param {function} fn the key->value function
   * @param {Iterable<any>} [domain] optional domain of the function
   */
  constructor(fn, domain = []) {
    this.fn = fn;
    this.domain = domain;
    this.parent = null;
  }

  /**
   * Return the application of the function to the given key.
   *
   * @param {any} key
   */
  async get(key) {
    const value =
      this.fn.length <= 1
        ? // Function takes no arguments or only one argument: invoke
          await this.fn.call(null, key)
        : // Bind the key to the first parameter. Subsequent get calls will
          // eventually bind all parameters until only one remains. At that point,
          // the above condition will apply and the function will be invoked.
          Reflect.construct(this.constructor, [this.fn.bind(null, key)]);

    return value;
  }

  /**
   * Enumerates the function's domain (if defined) as the tree's keys. If no domain
   * was defined, this returns an empty iterator.
   */
  async keys() {
    return this.domain;
  }

  async unpack() {
    return this.fn;
  }
}
