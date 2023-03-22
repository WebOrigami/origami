import ExplorableGraph from "./ExplorableGraph.js";
import { isPlainObject, keySymbol } from "./utilities.js";

export default class ObjectGraph {
  /**
   * Create an explorable graph wrapping a given plain object or array.
   *
   * @param {PlainObject|Array} object The object/array to wrap.
   */
  constructor(object) {
    this.object = object;
    if (object[keySymbol]) {
      this[keySymbol] = object[keySymbol];
    }
  }

  /**
   * Return the value for the given key.
   *
   * @param {any} key
   */
  async get(key) {
    if (key === undefined) {
      // Getting undefined returns the graph itself.
      return this;
    }

    // We check to make sure the object itself has the key as an `own` property
    // because, if the object's an array, we don't want to return values for
    // keys like `map` and `find` that are Array prototype methods.
    let value =
      !(this.object instanceof Array) || this.object.hasOwnProperty(key)
        ? this.object[key]
        : undefined;
    const isPlain =
      value instanceof Array ||
      (isPlainObject(value) && !ExplorableGraph.isExplorable(value));
    if (isPlain) {
      // Wrap a returned array / plain object as an ObjectGraph.
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  async isKeyExplorable(key) {
    const value = this.object[key];
    return ExplorableGraph.canCastToExplorable(value);
  }

  /**
   * Enumerate the object's keys.
   */
  async keys() {
    // Walk up the prototype chain to Object.prototype.
    let obj = this.object;
    const result = [];
    while (obj !== Object.prototype) {
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
      result.push(...propertyNames);
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
  }
}

// Apply all updates from the source to the target.
async function applyUpdates(source, target) {
  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = Array.from(await source.keys(), (key) =>
    applyUpdateForKey(source, target, key)
  );
  return Promise.all(promises);
}

// Copy the value for the given key from the source to the target.
async function applyUpdateForKey(source, target, key) {
  const sourceValue = await source.get(key);
  if (sourceValue === undefined) {
    // Undefined source value means delete the key from the target.
    delete target.object[key];
    return;
  } else if (ExplorableGraph.isExplorable(sourceValue)) {
    const targetValue = await target.get(key);
    if (ExplorableGraph.isExplorable(targetValue)) {
      // Both source and target are explorable; recurse.
      await applyUpdates(sourceValue, targetValue);
      return;
    }
  }
  // Copy the value from the source to the target.
  target.object[key] = sourceValue;
}
