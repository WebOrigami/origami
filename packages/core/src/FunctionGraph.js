import FunctionDictionary from "./FunctionDictionary.js";
import GraphHelpers from "./GraphHelpers.js";

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

  /**
   * Apply the function to the given keys as arguments. If there are fewer keys
   * than the function accepts, return a new function that takes the remaining
   * arguments. If there are more keys than the function accepts, apply the
   * function to the first arguments, then take that result as a graph and
   * traverse it with the remaining keys.
   */
  async traverse(...keys) {
    let value;
    if (this.fn.length > 0 && keys.length < this.fn.length) {
      // Partial function application.
      const fn = this.fn.bind(undefined, ...keys);
      value = Reflect.construct(this.constructor, [fn]);
    } else {
      // Call the function with the given keys.
      value = this.fn.call(undefined, ...keys);
      if (this.fn.length > 0 && keys.length > this.fn.length) {
        // Traverse the result with the remaining keys.
        const rest = keys.slice(this.fn.length);
        value = await GraphHelpers.traverse(value, ...rest);
      }
    }
    return value;
  }
}
