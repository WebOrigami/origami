export default class ExplorableGraph {
  async *[Symbol.asyncIterator]() {
    yield* [];
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * Default implementation returns undefined for any key.
   *
   * @param {...any} keys
   * @returns {Promise<any>}
   */
  async get(...keys) {}

  /**
   * Returns the graph's keys as an array.
   *
   * @returns {Promise<any[]>}
   */
  async keys() {
    const result = [];
    for await (const key of this) {
      result.push(key);
    }
    return result;
  }

  /**
   * Create a plain JavaScript object with the graph's keys cast to strings,
   * and the given `mapFn` applied to values.
   *
   * @param {function} mapFn
   */
  async mapValues(mapFn) {
    const result = {};
    for await (const key of this) {
      const value = await this.get(key);
      // TODO: Check that value is of same constructor before traversing into it?
      result[String(key)] =
        value instanceof ExplorableGraph
          ? // value is also explorable; traverse into it.
            await value.mapValues(mapFn)
          : await mapFn(value);
    }
    return result;
  }

  /**
   * Converts a graph into a plain JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   */
  async plain() {
    return await this.mapValues((value) => value);
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values cast to strings.
   */
  async strings() {
    return await this.mapValues(async (value) => {
      const obj = await value;
      // If obj is a primitive type, we won't be able to call toString
      return obj.toString ? obj.toString() : "";
    });
  }

  /**
   * Converts a graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values being `null`.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to its structure.
   */
  async structure() {
    return await this.mapValues(() => null);
  }

  /**
   * Performs a depth-first traversal of the explorable.
   *
   * Note: This does not check for or prevent cycles.
   *
   * @param {function} callback
   * @param {any[]} [route]
   */
  async traverse(callback, route = []) {
    for await (const key of this) {
      const extendedRoute = [...route, key];
      const value = await this.get(key);
      const interior = value instanceof ExplorableGraph;
      await callback(extendedRoute, interior, value);
      if (interior) {
        await value.traverse(callback, extendedRoute);
      }
    }
  }
}
