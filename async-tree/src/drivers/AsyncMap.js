import * as trailingSlash from "../trailingSlash.js";

export default class AsyncMap {
  /** @type {AsyncMap|null} */
  _parent = null;

  _readOnly;

  [Symbol.asyncIterator]() {
    return this.entries();
  }

  /**
   * Remove all key/value entries from the map.
   *
   * This method invokes the `keys()` and `delete()` methods.
   */
  async clear() {
    const promises = [];
    for await (const key of this.keys()) {
      promises.push(this.delete(key));
    }
    await Promise.all(promises);
  }

  /**
   * Removes the entry for the given key, return true if an entry was removed
   * and false if there was no entry for the key.
   *
   * @param {any} key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    throw new Error("delete() not implemented");
  }

  static EMPTY = Symbol("EMPTY");

  /**
   * Returns a new `AsyncIterator` object that contains a two-member array of
   * [key, value] for each element in the map in insertion order.
   *
   * This method invokes the `keys()` and `get()` methods.
   *
   * @returns {AsyncIterableIterator<[any, any]>}
   */
  async *entries() {
    const keys = [];
    const valuePromises = [];
    // Invoke get() calls without waiting; some may take longer than others
    for await (const key of this.keys()) {
      keys.push(key);
      valuePromises.push(this.get(key));
    }
    // Now wait for all promises to resolve
    const values = await Promise.all(valuePromises);
    for (let i = 0; i < keys.length; i++) {
      yield [keys[i], values[i]];
    }
  }

  /**
   * Calls `callback` once for each key/value pair in the map, in insertion order.
   *
   * This method invokes the `entries()` method.
   *
   * @param {(value: any, key: any, thisArg: any) => Promise<void>} callback
   * @param {any?} thisArg
   */
  async forEach(callback, thisArg = this) {
    for await (const [key, value] of this.entries()) {
      await callback(value, key, thisArg);
    }
  }

  /**
   * Returns the value associated with the key, or undefined if there is none.
   *
   * @param {any} key
   * @returns {Promise<any>}
   */
  async get(key) {
    throw new Error("get() not implemented");
  }

  /**
   * Groups items from an async iterable into an AsyncMap according to the keys
   * returned by the given function.
   *
   * @param {Iterable<any>|AsyncIterable<any>} iterable
   * @param {(element: any, index: any) => Promise<any>} keyFn
   * @returns {Promise<Map>}
   */
  static async groupBy(iterable, keyFn) {
    const map = new Map();
    let index = 0;
    for await (const element of iterable) {
      const key = await keyFn(element, index);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(element);
      index++;
    }
    return map;
  }

  /**
   * Returns true if the given key appears in the set returned by keys().
   *
   * It doesn't matter whether the value returned by get() is defined or not.
   *
   * If the requested key has a trailing slash but has no associated value, but
   * the alternate form with a slash does appear, this returns true.
   *
   * @param {any} key
   */
  async has(key) {
    const alternateKey = !trailingSlash.has(key)
      ? trailingSlash.add(key)
      : null;
    for await (const k of this.keys()) {
      if (k === key) {
        return true;
      }
      if (alternateKey && k === alternateKey) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a new `AsyncIterator` object that contains the keys for each
   * element in the map in insertion order.
   *
   * @returns {AsyncIterableIterator<any>}
   */
  async *keys() {
    throw new Error("keys() not implemented");
  }

  /**
   * The parent of this node in a tree.
   */
  get parent() {
    return this._parent;
  }
  set parent(parent) {
    this._parent = parent;
  }

  /**
   * True if the object is read-only. This will be true if `get()` has been
   * overridden but `set()` and `delete()` have not.
   */
  get readOnly() {
    return (
      this.get !== AsyncMap.prototype.get &&
      (this.set === AsyncMap.prototype.set ||
        this.delete === AsyncMap.prototype.delete)
    );
  }

  /**
   * Sets the value for the given key.
   *
   * @param {any} key
   * @param {any} value
   * @returns {Promise<AsyncMap>}
   */
  async set(key, value) {
    throw new Error("set() not implemented");
  }

  /**
   * Returns the number of keys in the map.
   *
   * The `size` property invokes an overridden `keys()` to ensure proper
   * behavior in subclasses. Because a subclass may not enforce a direct
   * correspondence between `keys()` and `get()`, the size may not reflect the
   * number of values that can be retrieved.
   *
   * @type {Promise<number>}
   */
  get size() {
    return (async () => {
      let count = 0;
      for await (const _ of this.keys()) {
        count++;
      }
      return count;
    })();
  }

  /**
   * Returns a new `AsyncIterator` object that contains the values for each
   * element in the map in insertion order.
   *
   * @returns {AsyncIterableIterator<any>}
   */
  async *values() {
    const valuePromises = [];
    // Invoke get() calls without waiting; some may take longer than others
    for await (const key of this.keys()) {
      valuePromises.push(this.get(key));
    }
    // Now wait for all promises to resolve
    const values = await Promise.all(valuePromises);
    yield* values;
  }
}
