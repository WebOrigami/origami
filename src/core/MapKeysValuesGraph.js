import ExplorableGraph from "./ExplorableGraph.js";
import * as utilities from "./utilities.js";

/**
 * Given a graph and a function, return a new explorable graph that applies the
 * function to the original graph's values. Optionally transform the original
 * graph's keys.
 */
export default class MapKeysValuesGraph {
  /**
   * @param {GraphVariant} variant
   * @param {Invocable} mapFn
   * @param {PlainObject} options
   */
  constructor(variant, mapFn, options = {}) {
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
    this.deep = options.deep ?? false;
    this.options = options;
  }

  async *[Symbol.asyncIterator]() {
    const keys = new Set();
    for await (const innerKey of this.graph) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (!keys.has(outerKey)) {
        keys.add(outerKey);
        yield outerKey;
      }
    }
  }

  // Apply the mapping function to the original graph's values.
  async get(outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);

    let outerValue;
    if (innerKey !== outerKey) {
      // First check to see if the outer key already exists in the source graph.
      // If it does, we assume it's already been explicitly mapped, so we'll use
      // that value instead of mapping it ourselves.
      outerValue = await this.graph.get(outerKey);
    }
    if (outerValue === undefined) {
      // Ask inner graph for value.
      const innerValue = await this.graph.get(innerKey);
      // Determine whether we want to apply the map to this value.
      const applyMap = await this.mapApplies(innerValue, outerKey, innerKey);
      // Apply map if desired, otherwise use inner value as is.
      outerValue = applyMap
        ? await this.mapFn.call(this, innerValue, outerKey, innerKey)
        : innerValue;
    }

    // If the value to return is an explorable graph, wrap it with a map.
    if (this.deep && ExplorableGraph.isExplorable(outerValue)) {
      outerValue = Reflect.construct(this.constructor, [
        outerValue,
        this.mapFn,
        this.options,
      ]);
    }

    return outerValue;
  }

  async innerKeyForOuterKey(outerKey) {
    return outerKey;
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    // By default, we only apply the map to real values.
    return innerValue !== undefined;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey;
  }
}