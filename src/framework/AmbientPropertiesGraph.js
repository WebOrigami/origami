import { isPlainObject } from "../core/utilities.js";

/**
 * Helper class for defining a graph of ambient properties.
 *
 * This is simpler than ExplorableObject: it doesn't expose the object's keys,
 * just makes object's values available. It also doesn't support `set`, nor does
 * it wrap returned graphs with its own class.
 */
export default class AmbientPropertiesGraph {
  constructor(object) {
    if (!isPlainObject(object)) {
      throw new TypeError(
        "Ambient properties must be defined as a plain JavaScript object."
      );
    }
    this.object = object;
  }

  // We define this so that class instances are considered to be explorable, but
  // we don't yield any keys.
  async *[Symbol.asyncIterator]() {}

  async get(key) {
    return this.object[key];
  }
}
