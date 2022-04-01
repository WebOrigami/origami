import ExplorableGraph from "./ExplorableGraph.js";
import { isPlainObject } from "./utilities.js";

export default class ExplorableObject {
  constructor(object) {
    if (!isPlainObject(object)) {
      throw new TypeError(
        "The argument to the ExplorableObject constructor must be a plain JavaScript object."
      );
    }
    this.object = object;
  }

  async *[Symbol.asyncIterator]() {
    // Iterate over the object's keys.
    yield* Object.keys(this.object);
  }

  /**
   * Return the value for the given key.
   *
   * @param {any} key
   */
  async get(key) {
    let value = this.object[key];
    if (isPlainObject(value)) {
      // Wrap a returned plain object as an ExplorableObject.
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  async isKeyExplorable(key) {
    const value = this.object[key];
    // This definition is different than ExplorableGraph.canCastToExplorable
    // because it excludes strings. String values can be explorable if they're
    // JSON/YAML, but without further information, we assume they're not.
    return (
      value instanceof Array ||
      value instanceof Function ||
      ExplorableGraph.isExplorable(value) ||
      isPlainObject(value)
    );
  }

  /**
   * Add or overwrite the value for the given key. If the value is undefined,
   * delete the key. If only one argument is passed and it is explorable, apply
   * the explorable's values as updates to the current graph.
   *
   * @param {any} key
   * @param {any} value
   */
  async set(key, value) {
    if (arguments.length === 1) {
      // Recursively write out an explorable argument as updates.
      const graph = ExplorableGraph.from(key);
      await applyUpdates(graph, this);
    } else if (value === undefined) {
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
