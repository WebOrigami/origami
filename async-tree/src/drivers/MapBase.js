import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";

const previewSymbol = Symbol("preview");

/**
 * A base class for creating custom Map subclasses for use in trees.
 *
 * Instances of MapBase (and its subclasses) pass `instanceof Map`, and all Map
 * methods have compatible signatures.
 *
 * Subclasses may be read-only or read-write. A read-only subclass overrides
 * get() but not set() or delete(). A read-write subclass overrides all three
 * methods.
 *
 * For use in trees, MapBase instances may indicate a `parent` node. They can
 * also indicate children subtrees using the trailing slash convention: a key
 * for a subtree may optionally end with a slash. The get() and has() methods
 * support optional trailing slashes on keys.
 */
export default class MapBase extends Map {
  _initialized = false;

  constructor(iterable) {
    super(iterable);

    // To support the `iterable` argument, we have to allow set() to be called
    // during initialization; i.e., during construction. After initialization,
    // calling set() on a read-only subclass will throw.
    this._initialized = true;

    /** @type {MapBase|null} */
    this._parent = null;

    // Record self-reference for use in Map method calls, which insist on the
    // receiver being a Map instance. This allows method calls to work even when
    // the prototype chain is extended via Object.create().
    this._self = this;
  }

  delete(key) {
    if (this.readOnly) {
      throw new Error("delete() can't be called on a read-only map");
    }
    return super.delete.call(this._self, key);
  }

  // Override entries() method to call overridden get() and keys().
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

  forEach(callback, thisArg = this) {
    for (const [key, value] of this.entries()) {
      callback(value, key, thisArg);
    }
  }

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

  // has() returns true if the key appears in the set returned by keys(); it
  // doesn't matter whether the value returned by get() is defined or not.
  // If the key with a trailing slash doesn't appear, but the
  // alternate form with a slash does appear, this returns true.
  has(key) {
    const keys = Array.from(this.keys());
    return (
      keys.includes(key) ||
      (!trailingSlash.has(key) && keys.includes(trailingSlash.add(key)))
    );
  }

  keys() {
    return super.keys.call(this._self);
  }

  get parent() {
    return this._parent;
  }
  set parent(parent) {
    this._parent = parent;
  }

  // Read-write subclasses that override get() must also override both delete()
  // and set().
  get readOnly() {
    const overridesGet = this.get !== MapBase.prototype.get;
    const overridesDelete = this.delete !== MapBase.prototype.delete;
    const overridesSet = this.set !== MapBase.prototype.set;
    return overridesGet && !(overridesDelete && overridesSet);
  }

  set(key, value) {
    if (this._initialized && this.readOnly) {
      throw new Error("set() can't be called on a read-only map");
    }
    // If _self is not set, use the current instance as the receiver. This is
    // necessary to let the constructor call `super()`.
    const target = this._self ?? this;
    return super.set.call(target, key, value);
  }

  // We define the size to be the number of keys
  get size() {
    const keys = Array.from(this.keys());
    return keys.length;
  }

  [Symbol.iterator]() {
    return this.entries();
  }

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
Object.defineProperty(MapBase.prototype, previewSymbol, {
  configurable: true,
  enumerable: false,
  get: function () {
    return Array.from(this.entries());
  },
});
