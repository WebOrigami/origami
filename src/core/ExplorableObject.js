import ExplorableGraph from "./ExplorableGraph.js";
import { isPlainObject } from "./utilities.js";

export default class ExplorableObject {
  #obj;

  constructor(obj) {
    if (!isPlainObject(obj)) {
      throw new TypeError(
        "The argument to the ExplorableObject constructor must be a plain JavaScript object."
      );
    }
    this.#obj = obj;
  }

  async *[Symbol.asyncIterator]() {
    // If the object defines an iterator, defer to that.
    if (this.#obj[Symbol.asyncIterator]) {
      yield* this.#obj[Symbol.asyncIterator]();
    } else {
      // Iterate over the object's keys.
      yield* Object.keys(this.#obj);
    }
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {...any} keys
   */
  async get(...keys) {
    // If the object defines its own `get` method, defer to that.
    if (typeof this.#obj.get === "function") {
      return await this.#obj.get(...keys);
    }

    // No keys: return this graph as is.
    if (keys.length === 0) {
      return this;
    }

    // Traverse the keys.
    let value = this.#obj;
    while (value !== undefined && keys.length > 0) {
      const key = keys.shift();
      value = value[key];
      if (ExplorableGraph.isExplorable(value) && keys.length > 0) {
        return value.get(...keys);
      }
    }

    if (keys.length > 0 && ExplorableGraph.canCastToExplorable(value)) {
      value = await ExplorableGraph.from(value).get(...keys);
    }
    if (isPlainObject(value) && !(value instanceof this.constructor)) {
      value = Reflect.construct(this.constructor, [value]);
    }

    return value;
  }

  /**
   * Add or overwrite the value at a given location in the graph. Given a set of
   * arguments, take the last argument as a value, and the ones before it as a
   * path. If only one explorable argument is supplied, apply its values over
   * the current graph. If only one non-explorable argument is supplied, use
   * that as a key, and take the value as undefined.
   *
   * @param  {...any} args
   */
  async set(...args) {
    // If the object defines its own `set` method, defer to that.
    if (typeof this.#obj.set === "function") {
      return await this.#obj.set(...args);
    }

    if (args.length === 0) {
      // No-op
      return;
    }
    const value =
      args.length === 1 && !ExplorableGraph.isExplorable(args[0])
        ? undefined
        : args.pop();
    const keys = args;

    // Traverse the keys
    let current = this.#obj;
    while (keys.length > 1) {
      const key = keys.shift();
      let next = current[key];
      if (!isPlainObject(next)) {
        // Overwrite path
        next = {};
        current[key] = next;
      }
      current = next;
    }

    const key = keys.shift();
    if (ExplorableGraph.isExplorable(value)) {
      let subobject;
      if (key === undefined) {
        subobject = current;
      } else if (current[key] !== undefined) {
        subobject = current[key];
      } else {
        subobject = {};
        current[key] = subobject;
      }
      // Recursively write out the values in the graph.
      const subgraph =
        subobject === this.#obj ? this : new ExplorableObject(subobject);
      for await (const subkey of value) {
        const subvalue = await value.get(subkey);
        await subgraph.set(subkey, subvalue);
      }
    } else if (value === undefined) {
      delete current[key];
    } else {
      current[key] = value;
    }
  }
}
