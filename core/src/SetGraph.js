import SetDictionary from "./SetDictionary.js";

/**
 * A graph of Set objects.
 *
 * @typedef {import("@graphorigami/types").AsyncGraph} AsyncGraph
 * @implements {AsyncGraph}
 */
export default class SetGraph extends SetDictionary {
  async get(key) {
    let value = await super.get(key);
    if (value instanceof Set) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }
}
