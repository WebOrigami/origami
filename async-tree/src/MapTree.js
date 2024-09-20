import { Tree } from "./internal.js";
import * as trailingSlash from "./trailingSlash.js";
import { setParent } from "./utilities.js";

/**
 * A tree backed by a JavaScript `Map` object.
 *
 * Note: By design, the standard `Map` class already complies with the
 * `AsyncTree` interface. This class adds some additional tree behavior, such as
 * constructing subtree instances and setting their `parent` property. While
 * we'd like to construct this by subclassing `Map`, that class appears
 * puzzingly and deliberately implemented to break subclasses.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
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
    // Try key as is
    let value = this.map.get(key);
    if (value === undefined) {
      // Try the other variation of the key
      const alternateKey = trailingSlash.toggle(key);
      value = this.map.get(alternateKey);
      if (value === undefined) {
        // Key doesn't exist
        return undefined;
      }
    }

    value = await value;

    if (value === undefined) {
      // Key exists but value is undefined
      return undefined;
    }

    setParent(value, this);
    return value;
  }

  async isKeyForSubtree(key) {
    const baseKey = trailingSlash.remove(key);
    const value = this.map.get(baseKey);
    return Tree.isAsyncTree(value);
  }

  async keys() {
    const mapKeys = this.map.keys();
    const keys = [];
    for (const key of mapKeys) {
      keys.push(trailingSlash.add(key, await this.isKeyForSubtree(key)));
    }
    return keys;
  }

  async set(key, value) {
    this.map.set(key, value);
    return this;
  }
}
