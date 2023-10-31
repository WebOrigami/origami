import * as Tree from "./Tree.js";

/**
 * A tree backed by a JavaScript `Map` object.
 *
 * Note: By design, the standard `Map` class already complies with the
 * `AsyncTree` interface. This class adds some additional tree behavior, such as
 * constructing subtree instances and setting their `parent` property.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class MapTree {
  /**
   * @param {Iterable} [iterable]
   */
  constructor(iterable = []) {
    this.map = new Map(iterable);
    this.parent = null;
  }

  async get(key) {
    let value = this.map.get(key);

    if (value instanceof Map) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (Tree.isAsyncTree(value) && !value.parent) {
      value.parent = this;
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
