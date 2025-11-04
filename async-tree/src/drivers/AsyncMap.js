import * as trailingSlash from "../trailingSlash.js";

export default class AsyncMap {
  /** @type {AsyncMap|null} */
  _parent = null;

  _readOnly;

  [Symbol.asyncIterator]() {
    return this.entries();
  }

  /**
   * Remove all entries from the map.
   *
   * This requires that the subclass implement delete().
   */
  async clear() {
    for await (const key of this.keys()) {
      await this.delete(key);
    }
  }

  /**
   * Deletes the given key from the map.
   *
   * Returns true if the key was present and deleted, false if not.
   *
   * @param {any} key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    throw new Error("delete() not implemented");
  }

  static EMPTY = Symbol("EMPTY");

  /**
   * Returns an async iterable of the map's key-value pairs.
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
   * Invokes a callback for each key-value pair in the map.
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
   * Returns the value for the given key.
   *
   * @param {any} key
   * @returns {Promise<any>}
   */
  async get(key) {
    throw new Error("get() not implemented");
  }

  /**
   * Groups items from an async iterable into an AsyncMap according to
   * the keys returned by the given function.
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
   * If the key with a trailing slash doesn't appear, but the alternate form
   * with a slash does appear, this returns true.
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
   * Returns an async iterable of the map's keys.
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
   * True if the object is read-only. This will be true if get() has been
   * overridden but set() and delete() have not.
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
   * The number of keys in the map.
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
   * Returns an async iterable of the map's values.
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
