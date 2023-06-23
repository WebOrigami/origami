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
    return key === undefined
      ? this // Getting undefined returns the dictionary itself.
      : this.values[key];
  }

  async keys() {
    return this.values.keys();
  }
}
