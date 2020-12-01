import { get, keys } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";

export default class ExplorableArray extends Explorable {
  /**
   * @param {Array} array
   */
  constructor(array) {
    super();
    this.array = array;
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {any[]} keys
   */
  [get](...keys) {
    if (keys.length === 0) {
      return this;
    }

    const [key, ...rest] = keys;
    const value = this.array[key];
    return value instanceof Explorable ? value[get](...rest) : value;
  }

  [keys]() {
    return this.array.keys()[Symbol.iterator]();
  }
}
