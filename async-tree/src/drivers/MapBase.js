import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";
import toString from "../utilities/toString.js";

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

  forEach(callback, thisArg) {
    return super.forEach.call(this._self, callback, thisArg);
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

  has(key) {
    return (
      super.has.call(this._self, key) ||
      (!trailingSlash.has(key) &&
        super.has.call(this._self, trailingSlash.add(key)))
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
    return super.set.call(this._self ?? this, key, value);
  }

  get size() {
    const descriptor = Object.getOwnPropertyDescriptor(Map.prototype, "size");
    return descriptor.get.call(this._self);
  }

  get [Symbol.iterator]() {
    const self = this._self;
    return () => super[Symbol.iterator].call(self);
  }

  values() {
    return super.values.call(this._self);
  }
}

// For debugging
Object.defineProperty(MapBase.prototype, previewSymbol, {
  configurable: true,
  enumerable: false,
  get: function () {
    const entries = Array.from(this.entries());
    const strings = entries.map(([key, value]) => {
      const string = toString(value) ?? value;
      return [key, string];
    });
    return Object.fromEntries(strings);
  },
});
