export default class ExplorableGraph {
  /**
   * @returns {AsyncIterableIterator<any>}
   */
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

  static [Symbol.hasInstance](instance) {
    return this === ExplorableGraph
      ? instance !== undefined &&
          typeof instance[Symbol.asyncIterator] === "function" &&
          typeof instance.get === "function"
      : this.prototype.isPrototypeOf(instance);
  }

  /**
   * Returns the graph's keys as an array.
   */
  static async keys(graph) {
    const result = [];
    for await (const key of graph) {
      result.push(key);
    }
    return result;
  }

  /**
   * Create a plain JavaScript object with the graph's keys cast to strings,
   * and the given `mapFn` applied to values.
   *
   * @param {ExplorableGraph} graph
   * @param {function} mapFn
   */
  static async mapValues(graph, mapFn) {
    const result = {};
    for await (const key of graph) {
      const value = await graph.get(key);
      // TODO: Check that value is of same constructor before traversing into it?
      result[String(key)] =
        value instanceof ExplorableGraph
          ? // value is also explorable; traverse into it.
            await this.mapValues(value, mapFn)
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
   * @param {ExplorableGraph} graph
   */
  static async plain(graph) {
    return await this.mapValues(graph, (value) => value);
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values cast to strings.
   *
   * @param {ExplorableGraph} graph
   */
  static async strings(graph) {
    return await this.mapValues(graph, async (value) => {
      const obj = await value;
      // If obj is a primitive type, we won't be able to call toString
      return obj?.toString?.();
    });
  }
}
