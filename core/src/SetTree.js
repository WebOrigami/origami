import SetDictionary from "./SetDictionary.js";

/**
 * A tree of Set objects.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SetTree extends SetDictionary {
  async get(key) {
    let value = await super.get(key);
    if (value instanceof Set) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }
}
