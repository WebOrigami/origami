/**
 * A dictionary backed by a Map.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableDictionary} AsyncMutableDictionary
 * @implements {AsyncMutableDictionary}
 */
export default class MapDictionary {
  /**
   * @param {Iterable} [iterable]
   */
  constructor(iterable = []) {
    this.map = new Map(iterable);
  }

  async get(key) {
    return key === undefined
      ? this // Getting undefined returns the dictionary itself.
      : this.map.get(key);
  }

  async keys() {
    return this.map.keys();
  }

  async set(key, value) {
    this.map.set(key, value);
    return this;
  }
}
