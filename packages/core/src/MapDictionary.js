import defaultValueKey from "./defaultValueKey.js";

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

    if (value === undefined && key === defaultValueKey) {
      // The default value is the underlying dictionary itself.
      value = this.map;
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
