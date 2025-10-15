import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";

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

  /** @type {MapBase|null} */
  _parent = null;

  constructor(iterable) {
    super(iterable);

    // To support the `iterable` argument, we have to allow set() to be called
    // during initialization; i.e., during construction. After initialization,
    // calling set() on a read-only subclass will throw.
    this._initialized = true;
  }

  delete(key) {
    if (this.readOnly) {
      throw new Error("delete() can't be called on a read-only map");
    }
    return super.delete(key);
  }

  get(key) {
    let value = super.get(key);
    if (value === undefined) {
      // Try alternate key with trailing slash added or removed
      value = super.get(trailingSlash.toggle(key));
    }
    if (value === undefined) {
      return undefined;
    }
    setParent(value, this);
    return value;
  }

  has(key) {
    return (
      super.has(key) ||
      (!trailingSlash.has(key) && super.has(trailingSlash.add(key)))
    );
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
    return super.set(key, value);
  }
}
