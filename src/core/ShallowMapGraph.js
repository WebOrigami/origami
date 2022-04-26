import * as utilities from "../core/utilities.js";
import ExplorableGraph from "./ExplorableGraph.js";

export default class ShallowMapGraph {
  /**
   * @param {GraphVariant} variant
   * @param {Invocable} mapFn
   */
  constructor(variant, mapFn) {
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  async get(key) {
    let value = await this.graph.get(key);
    return value !== undefined
      ? await this.mapFn.call(this, value, key) // Return mapped value
      : undefined;
  }
}
