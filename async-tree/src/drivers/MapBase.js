import * as trailingSlash from "../trailingSlash.js";

/**
 * A base class for creating custom Map subclasses.
 *
 * JavaScript's built-in Map class has some behaviors that make it difficult to
 * subclass directly. Subclassing MapBase instead of Map makes this easier.
 * Instances of MapBase (and its subclasses) pass `instanceof Map`, and all Map
 * methods have compatible signatures.
 *
 * Subclasses may be read-only or read-write. A read-only subclass overrides
 * get() but not set() or delete(). A read-write subclass overrides all three
 * methods.
 */
export default class MapBase extends Map {
  _initialized = false;

  constructor(iterable) {
    super(iterable);

    // To support the `iterable` argument, we have to allow set() to be called
    // during initialization; i.e., during construction. After initialization,
    // calling set() on a read-only subclass will throw.
    this._initialized = true;
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }

  delete(key) {
    if (this.isReadOnly) {
      throw new Error("delete() can't be called on a read-only map");
    }
    // JS Map class requires explicit `this` when calling delete()
    return super.delete.call(this, key);
  }

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
    for (const [key, value] of this.entries()) {
      callback.call(thisArg, value, key, this);
    }
  }

  get(key) {
    // JS Map class requires explicit `this` when calling get()
    return super.get.call(this, key);
  }

  has(key) {
    return (
      super.has(key) ||
      (!trailingSlash.has(key) && super.has(trailingSlash.add(key)))
    );
  }

  // Read-write subclasses that override get() must also override both delete()
  // and set().
  get isReadOnly() {
    const overridesGet = this.get !== MapBase.prototype.get;
    const overridesDelete = this.delete !== MapBase.prototype.delete;
    const overridesSet = this.set !== MapBase.prototype.set;
    return overridesGet && !(overridesDelete && overridesSet);
  }

  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }

  keys() {
    // JS Map class requires explicit `this` when calling keys()
    return super.keys.call(this);
  }

  set(key, value) {
    if (this._initialized && this.isReadOnly) {
      throw new Error("set() can't be called on a read-only map");
    }
    // JS Map class requires explicit `this` when calling set()
    return super.set.call(this, key, value);
  }

  get size() {
    return Array.from(this.keys()).length;
  }

  values() {
    // See notes in entries()
    const self = this;
    function* gen() {
      for (const key of self.keys()) {
        yield self.get(key);
      }
    }
    return /** @type {MapIterator<any>} */ (gen());
  }
}
