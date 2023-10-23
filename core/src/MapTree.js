import MapDictionary from "./MapDictionary.js";

/**
 * A tree of Map objects.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class MapTree extends MapDictionary {
  constructor(map) {
    super(map);
    this.parent2 = null;
  }

  async get(key) {
    let value = await super.get(key);
    if (value instanceof Map) {
      value = Reflect.construct(this.constructor, [value]);
      value.parent2 = this;
    }
    return value;
  }
}
