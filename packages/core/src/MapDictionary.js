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
    let value = this.map.get(key);

    if (value === undefined && key === "") {
      // If the empty string isn't a key for a defined value, return the
      // dictionary itself.
      value = this;
    }

    return value;
  }

  async keys() {
    return this.map.keys();
  }

  async set(key, value) {
    this.map.set(key, value);
    return this;
  }
}
