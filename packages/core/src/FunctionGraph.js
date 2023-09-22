import FunctionDictionary from "./FunctionDictionary.js";

/**
 * A graph defined by a function and an optional domain.
 *
 * @typedef {import("@graphorigami/types").AsyncGraph} AsyncGraph
 * @implements {AsyncGraph}
 */
export default class FunctionGraph extends FunctionDictionary {
  /**
   * Return the application of the function to the given key.
   *
   * @param {any} key
   */
  async get(key) {
    let value =
      this.fn.length <= 1
        ? // Function takes no arguments or only one argument: invoke
          await super.get(key)
        : // Bind the key to the first parameter. Subsequent get calls will
          // eventually bind all parameters until only one remains. At that point,
          // the above condition will apply and the function will be invoked.
          Reflect.construct(this.constructor, [this.fn.bind(this, key)]);
    return value;
  }
}
