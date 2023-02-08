import ExplorableGraph from "./ExplorableGraph.js";
import { isPlainObject } from "./utilities.js";

export default class ObjectGraph {
  /**
   * Create an explorable graph wrapping a given plain object or array.
   *
   * @param {PlainObject|Array} object The object/array to wrap.
   */
  constructor(object) {
    if (!(object instanceof Array) && !isPlainObject(object)) {
      throw new TypeError(
        "The argument to the ObjectGraph constructor must be a plain JavaScript object or array."
      );
    }
    this.object = object;
  }

  /**
   * Yield the object's keys.
   */
  async *[Symbol.asyncIterator]() {
    yield* Object.keys(this.object);
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
    let value = this.object.hasOwnProperty(key) ? this.object[key] : undefined;
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
  const promises = [];
  for await (const key of source) {
    const updateKeyPromise = applyUpdateForKey(source, target, key);
    promises.push(updateKeyPromise);
  }
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
