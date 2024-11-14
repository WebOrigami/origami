import { setParent } from "../utilities.js";

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
    if (key == null) {
      // Reject nullish key.
      throw new ReferenceError(
        `${this.constructor.name}: Cannot get a null or undefined key.`
      );
    }

    const value = this.values[key];
    setParent(value, this);
    return value;
  }

  async keys() {
    return this.values.keys();
  }
}
