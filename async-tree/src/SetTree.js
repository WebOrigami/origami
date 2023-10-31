import * as Tree from "./Tree.js";

/**
 * A tree of Set objects.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SetTree {
  /**
   * @param {Set} set
   */
  constructor(set) {
    this.values = [...set];
    this.parent = null;
  }

  async get(key) {
    let value = this.values[key];

    if (value instanceof Set) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (Tree.isAsyncTree(value) && !value.parent) {
      value.parent = this;
    }

    return value;
  }

  async keys() {
    return this.values.keys();
  }
}
