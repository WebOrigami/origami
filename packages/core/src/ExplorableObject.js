import { isPlainObject } from "./builtIns.js";
import ExplorableGraph from "./ExplorableGraph.js";

export default class ExplorableObject extends ExplorableGraph {
  constructor(obj) {
    super();
    this.obj = obj;
  }

  async *[Symbol.asyncIterator]() {
    yield* Object.keys(this.obj);
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {...any} keys
   */
  async get(...keys) {
    // Traverse the keys.
    let value = this.obj;
    while (value !== undefined && keys.length > 0) {
      const key = keys.shift();
      value = value[key];
      if (value instanceof ExplorableGraph && keys.length > 0) {
        return value.get(...keys);
      }
    }

    return keys.length > 0
      ? undefined
      : isPlainObject(value)
      ? new ExplorableObject(value)
      : value;
  }
}
