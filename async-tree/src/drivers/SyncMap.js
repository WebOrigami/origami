import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";

const previewSymbol = Symbol("preview");

/**
 * A base class for creating custom Map subclasses for use in trees.
 *
 * Instances of SyncMap (and its subclasses) pass `instanceof Map`, and all Map
 * methods have compatible signatures.
 *
 * Subclasses may be read-only or read-write. A read-only subclass overrides
 * get() but not set() or delete(). A read-write subclass overrides all three
 * methods.
 *
 * For use in trees, SyncMap instances may indicate a `parent` node. They can
 * also indicate children subtrees using the trailing slash convention: a key
 * for a subtree may optionally end with a slash. The get() and has() methods
 * support optional trailing slashes on keys.
 */
export default class SyncMap extends Map {
  _initialized = false;

  constructor(iterable) {
    super(iterable);

    /** @type {SyncMap|null} */
    this._parent = null;

    // Record self-reference for use in Map method calls that insist on the
    // receiver being a Map instance. This allows method calls to work even when
    // the prototype chain is extended via Object.create().
    //
    // We separately use this member to determine whether the constructor has
    // been called to initialize the instance. See set().
    this._self = this;
  }

  // Return the child map for the given key, creating it if necessary. This is
  // the same as the child() operation's default behavior but is synchronous, so
  // it will be preferred by the child() operation over the default behavior.
  child(key) {
    let result = this.get(key);

    // If child is already a map we can use it as is
    if (!(result instanceof Map)) {
      // Create new child node using no-arg constructor
      result = new /** @type {any} */ (this.constructor)();
      this.set(key, result);
    }

    setParent(result, this);
    return result;
  }

  /**
   * Removes all key/value entries from the map.
   *
   * Unlike the standard `Map.prototype.clear()`, this method invokes an
   * overridden `keys()` and `delete()` to ensure proper behavior in subclasses.
   *
   * If the `readOnly` property is true, calling this method throws a
   * `TypeError`.
   */
  clear() {
    if (this.readOnly) {
      throw new TypeError("clear() can't be called on a read-only map");
    }
    for (const key of this.keys()) {
      this.delete(key);
    }
  }

  /**
   * Removes the entry for the given key, return true if an entry was removed
   * and false if there was no entry for the key.
   *
   * If the `readOnly` property is true, calling this method throws a
   * `TypeError`.
   */
  delete(key) {
    if (this.readOnly) {
      throw new TypeError("delete() can't be called on a read-only map");
    }
    return super.delete.call(this._self, key);
  }

  /**
   * Returns a new `Iterator` object that contains a two-member array of [key,
   * value] for each element in the map in insertion order.
   *
   * Unlike the standard `Map.prototype.clear()`, this method invokes an
   * overridden `keys()` and `get()` to ensure proper behavior in subclasses.
   */
  entries() {
    // We'd like to just define entries() as a generator but TypeScript
    // complains that it doesn't match the Map interface. We define the
    // generator internally and then cast it to the expected type.
    const self = this;
    function* gen() {
      for (const key of self.keys()) {
        yield [key, self.get(key)];
      }
    }
    return /** @type {MapIterator<[any, any]>} */ (gen());
  }

  /**
   * Calls `callback` once for each key/value pair in the map, in insertion order.
   *
   * Unlike the standard `Map.prototype.forEach()`, this method invokes an
   * overridden `entries()` to ensure proper behavior in subclasses.
   *
   * @param {(value: any, key: any, thisArg: any) => void} callback
   * @param {any?} thisArg
   */
  forEach(callback, thisArg = this) {
    for (const [key, value] of this.entries()) {
      callback(value, key, thisArg);
    }
  }

  /**
   * Returns the value associated with the key, or undefined if there is none.
   */
  get(key) {
    let value = super.get.call(this._self, key);
    if (value === undefined) {
      // Try alternate key with trailing slash added or removed
      value = super.get.call(this._self, trailingSlash.toggle(key));
    }
    if (value === undefined) {
      return undefined;
    }
    setParent(value, this);
    return value;
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
  has(key) {
    const keys = Array.from(this.keys());
    return (
      keys.includes(key) ||
      (!trailingSlash.has(key) && keys.includes(trailingSlash.add(key)))
    );
  }

  /**
   * Returns a new `Iterator` object that contains the keys for each element in
   * the map in insertion order.
   *
   * @returns {MapIterator<any>}
   */
  keys() {
    return super.keys.call(this._self);
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
   * True if the object is read-only. This will be true if the `get()` method has
   * been overridden but `set()` and `delete()` have not.
   */
  get readOnly() {
    return (
      this.get !== SyncMap.prototype.get &&
      (this.set === SyncMap.prototype.set ||
        this.delete === SyncMap.prototype.delete)
    );
  }

  /**
   * Adds a new entry with a specified key and value to this Map, or updates an
   * existing entry if the key already exists.
   *
   * If the `readOnly` property is true, calling this method throws a `TypeError`.
   */
  set(key, value) {
    // The Map constructor takes an optional `iterable` argument. If specified,
    // then set() will be called during construction. We want to allow this to
    // work even for read-only subclasses, so we allow set() to be called during
    // initialization. Once the `_self` member is set, we know initialization is
    // complete; after that point, calling set() on a read-only subclass will
    // throw.
    if (this._self !== undefined && this.readOnly) {
      throw new TypeError("set() can't be called on a read-only map");
    }
    // If _self is not set, use the current instance as the receiver. This is
    // necessary to let the constructor call `super()`.
    const target = this._self ?? this;

    return super.set.call(target, key, value);
  }

  /**
   * Returns the number of keys in the map.
   *
   * The `size` property invokes an overridden `keys()` to ensure proper
   * behavior in subclasses. Because a subclass may not enforce a direct
   * correspondence between `keys()` and `get()`, the size may not reflect the
   * number of values that can be retrieved.
   */
  get size() {
    const keys = Array.from(this.keys());
    return keys.length;
  }

  /**
   * Returns the map's `entries()`.
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   * Returns a new `Iterator` object that contains the values for each element
   * in the map in insertion order.
   */
  values() {
    // See notes at entries()
    const self = this;
    function* gen() {
      for (const key of self.keys()) {
        yield self.get(key);
      }
    }
    return /** @type {MapIterator<[any]>} */ (gen());
  }
}

// For debugging we make entries() available as a gettable property.
Object.defineProperty(SyncMap.prototype, previewSymbol, {
  configurable: true,
  enumerable: false,
  get: function () {
    return Array.from(this.entries());
  },
});
