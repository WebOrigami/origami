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
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  [get](key) {
    return this.array[key];
  }

  [keys]() {
    return this.array.keys()[Symbol.iterator]();
  }
}
