import defaultValueKey from "./defaultValueKey.js";

/**
 * Wraps a Set as an AsyncDictionary.
 *
 * This treats the set as an array, useing the integer indexes as keys.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @implements {AsyncDictionary}
 */
export default class SetDictionary {
  /**
   * @param {Set} set
   */
  constructor(set) {
    this.values = [...set];
  }

  async get(key) {
    // The dictionary's default value is the dictionary itself.
    return key === defaultValueKey ? this : this.values[key];
  }

  async keys() {
    return this.values.keys();
  }
}
