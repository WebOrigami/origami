import SetDictionary from "./SetDictionary.js";
import * as Tree from "./Tree.js";

/**
 * A tree of Set objects.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SetTree extends SetDictionary {
  constructor(set) {
    super(set);
    this.parent2 = null;
  }

  async get(key) {
    let value = await super.get(key);
    if (value instanceof Set) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (Tree.isAsyncTree(value)) {
      value.parent2 = this;
    }

    return value;
  }
}
