export default class ExplorableGraph {
  /**
   * Return true if the given object implements the necessary explorable graph
   * members: a function identified with `Symbol.asyncIterator`, and a function
   * named `get`.
   *
   * @param {any} obj
   */
  static isExplorable(obj) {
    return (
      typeof obj?.[Symbol.asyncIterator] === "function" &&
      typeof obj?.get === "function"
    );
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
   * @param {Explorable} graph
   * @param {function} mapFn
   */
  static async mapValues(graph, mapFn) {
    const result = {};
    for await (const key of graph) {
      const value = await graph.get(key);
      // TODO: Check that value is of same constructor before traversing into it?
      result[String(key)] = ExplorableGraph.isExplorable(value)
        ? await this.mapValues(value, mapFn) // Traverse into explorable value.
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
   * @param {Explorable} graph
   */
  static async plain(graph) {
    return await this.mapValues(graph, (value) => value);
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values cast to strings.
   *
   * @param {Explorable} graph
   */
  static async strings(graph) {
    return await this.mapValues(graph, async (value) => {
      const obj = await value;
      // If obj is a primitive type, we won't be able to call toString
      return obj?.toString?.();
    });
  }
}
