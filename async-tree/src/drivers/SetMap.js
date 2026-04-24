import SyncMap from "./SyncMap.js";

/**
 * A standard `Set` represented as a `Map`. The keys are integer indices; the
 * values are the set's values.
 */
export default class SetMap extends SyncMap {
  /**
   * @param {Set} set
   */
  constructor(set) {
    // Treat the set as an array-like map
    const entries = Array.from(set).map((value, index) => [index, value]);
    super(entries);
  }

  get(key) {
    if (key == null) {
      // Reject nullish key
      throw new ReferenceError(
        `${this.constructor.name}: Cannot get a null or undefined key.`,
      );
    }

    return super.get(key);
  }
}
