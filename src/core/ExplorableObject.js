import ExplorableGraph from "./ExplorableGraph.js";
import { constructSubgraph, isPlainObject } from "./utilities.js";

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
    // If the object defines an iterator, defer to that.
    if (this.object[Symbol.asyncIterator]) {
      yield* this.object[Symbol.asyncIterator]();
    } else {
      // Iterate over the object's keys.
      yield* Object.keys(this.object);
    }
  }

  constructSubgraph(dictionary) {
    return constructSubgraph(this.constructor, dictionary);
  }

  /**
   * Return the value for the given key.
   *
   * @param {any} key
   */
  async get2(key) {
    let value = this.object[key];
    if (isPlainObject(value) && !(value instanceof this.constructor)) {
      value = this.constructSubgraph({ object: value });
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
   * Add or overwrite the value at a given location in the graph. Given a set of
   * arguments, take the last argument as a value, and the ones before it as a
   * path. If only one explorable argument is supplied, apply its values over
   * the current graph. If only one non-explorable argument is supplied, use
   * that as a key, and take the value as undefined.
   *
   * @param  {...any} args
   */
  async set(...args) {
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
    let current = this.object;
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
        subobject === this.object ? this : new ExplorableObject(subobject);
      for await (const subkey of value) {
        const subvalue = await value.get2(subkey);
        await subgraph.set(subkey, subvalue);
      }
    } else if (value === undefined) {
      delete current[key];
    } else {
      current[key] = value;
    }
  }
}
