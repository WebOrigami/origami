import * as trailingSlash from "../trailingSlash.js";

export default class AsyncMap {
  /** @type {AsyncMap|null} */
  _parent = null;

  _readOnly;

  [Symbol.asyncIterator]() {
    return this.entries();
  }

  async clear() {
    for await (const key of this.keys()) {
      await this.delete(key);
    }
  }

  async delete(key) {
    throw new Error("delete() not implemented");
  }

  async *entries() {
    for await (const key of this.keys()) {
      const value = await this.get(key);
      const entry = [key, value];
      yield entry;
    }
  }

  async forEach(callback, thisArg = this) {
    for await (const [key, value] of this.entries()) {
      await callback(value, key, thisArg);
    }
  }

  /** @returns {Promise<any>} */
  async get(key) {
    throw new Error("get() not implemented");
  }

  // has() returns true if the key appears in the set returned by keys(); it
  // doesn't matter whether the value returned by get() is defined or not.
  // If the key with a trailing slash doesn't appear, but the
  // alternate form with a slash does appear, this returns true.
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
   * Return true if object is an instance of AsyncMap or Map.
   *
   * From an API perspective, Map is a essentially subclass of AsyncMap.
   */
  static [Symbol.hasInstance](object) {
    if (object instanceof Map) {
      return true;
    }
    let classFn = object.constructor;
    while (classFn && classFn !== Object) {
      if (classFn === this) {
        return true;
      }
      classFn = Object.getPrototypeOf(classFn);
    }
    return false;
  }

  async *keys() {
    throw new Error("keys() not implemented");
  }

  get parent() {
    return this._parent;
  }
  set parent(parent) {
    this._parent = parent;
  }

  // True if the object is read-only. This will be true if get() is overridden
  // but not set() and delete().
  /** @returns {boolean} */
  get readOnly() {
    if (this._readOnly === undefined) {
      // Walk up prototype chain. If we encounter get() before set() and
      // delete(), the object is read-only.
      let hasSet, hasDelete;
      let current = this;
      while (true) {
        if (!hasSet && current.hasOwnProperty("set")) {
          hasSet = true;
        }
        if (!hasDelete && current.hasOwnProperty("delete")) {
          hasDelete = true;
        }
        // At latest, this will be true of the SyncMap prototype
        if (current.hasOwnProperty("get")) {
          this._readOnly = !(hasSet && hasDelete);
          break;
        }
        current = Object.getPrototypeOf(current);
      }
    }
    return this._readOnly;
  }

  async set(key, value) {
    throw new Error("set() not implemented");
  }

  // We define the size to be the number of keys
  /** @type {Promise<number>} */
  get size() {
    return (async () => {
      let count = 0;
      for await (const key of this.keys()) {
        count++;
      }
      return count;
    })();
  }

  async *values() {
    for await (const [, value] of this.entries()) {
      yield value;
    }
  }
}
