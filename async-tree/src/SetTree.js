import { Tree } from "./internal.js";
import { setParent } from "./utilities.js";

/**
 * A tree of Set objects.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SetTree {
  /**
   * @param {Set} set
   */
  constructor(set) {
    this.values = Array.from(set);
    this.parent = null;
  }

  async get(key) {
    const value = this.values[key];
    setParent(value, this);
    return value;
  }

  async isKeyForSubtree(key) {
    const value = this.values[key];
    return Tree.isAsyncTree(value);
  }

  async keys() {
    return this.values.keys();
  }
}
