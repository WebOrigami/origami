import { Tree } from "./internal.js";
import * as symbols from "./symbols.js";
import { getRealmObjectPrototype, setParent } from "./utilities.js";

/**
 * A tree defined by a plain object or array.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class ObjectTree {
  /**
   * Create a tree wrapping a given plain object or array.
   *
   * @param {any} object The object/array to wrap.
   */
  constructor(object) {
    this.object = object;
    this.parent = object[symbols.parent] ?? null;
  }

  /**
   * Return the value for the given key.
   *
   * @param {any} key
   */
  async get(key) {
    // If the value is an array, we require that the key be one of its own
    // properties: we don't want to return Array prototype methods like `map`
    // and `find`.
    if (
      this.object instanceof Array &&
      key &&
      !this.object.hasOwnProperty(key)
    ) {
      return undefined;
    }

    let value = await this.object[key];
    setParent(value, this);

    if (typeof value === "function" && !Object.hasOwn(this.object, key)) {
      // Value is an inherited method; bind it to the object.
      value = value.bind(this.object);
    }

    return value;
  }

  async isKeyForSubtree(key) {
    const value = await this.object[key];
    return Tree.isAsyncTree(value);
  }

  /**
   * Enumerate the object's keys.
   */
  async keys() {
    // Walk up the prototype chain to realm's Object.prototype.
    let obj = this.object;
    const objectPrototype = getRealmObjectPrototype(obj);

    const result = new Set();
    while (obj && obj !== objectPrototype) {
      // Get the enumerable instance properties and the get/set properties.
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const propertyNames = Object.entries(descriptors)
        .filter(
          ([name, descriptor]) =>
            name !== "constructor" &&
            (descriptor.enumerable ||
              (descriptor.get !== undefined && descriptor.set !== undefined))
        )
        .map(([name]) => name);
      for (const name of propertyNames) {
        result.add(name);
      }
      obj = Object.getPrototypeOf(obj);
    }
    return result;
  }

  /**
   * Set the value for the given key. If the value is undefined, delete the key.
   *
   * @param {any} key
   * @param {any} value
   */
  async set(key, value) {
    if (value === undefined) {
      // Delete the key.
      delete this.object[key];
    } else {
      // Set the value for the key.
      this.object[key] = value;
    }
    return this;
  }
}
