import * as Dictionary from "./Dictionary.js";
import ObjectDictionary from "./ObjectDictionary.js";
import * as Tree from "./Tree.js";

/**
 * A tree defined by a plain object or array.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class ObjectTree extends ObjectDictionary {
  /**
   * Create a tree wrapping a given plain object or array.
   *
   * @param {any} object The object/array to wrap.
   */
  constructor(object) {
    super(object);
    this.parent = null;
  }

  async get(key) {
    let value = await super.get(key);

    const isPlain =
      value instanceof Array ||
      (Dictionary.isPlainObject(value) && !Dictionary.isAsyncDictionary(value));
    if (isPlain) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (Tree.isAsyncTree(value) && !value.parent) {
      value.parent = this;
    }

    return value;
  }

  async isKeyForSubtree(key) {
    const value = this.object[key];
    return Tree.isTreelike(value);
  }
}
