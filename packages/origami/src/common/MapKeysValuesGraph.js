import { GraphHelpers } from "@graphorigami/core";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";

/**
 * Given a graph and a function, return a new explorable graph that applies the
 * function to the original graph's values. Optionally transform the original
 * graph's keys.
 */
export default class MapKeysValuesGraph {
  /**
   * @param {GraphVariant} variant
   * @param {Invocable | null} mapFn
   * @param {PlainObject} options
   */
  constructor(variant, mapFn, options = {}) {
    this.graph = GraphHelpers.from(variant);
    this.mapFn = mapFn ? utilities.toFunction(mapFn) : null;
    this.deep = options.deep ?? false;
    this.getValue = options.getValue ?? true;
    this.preferExistingValue = options.preferExistingValue ?? false;
    this.options = options;
  }

  // Apply the mapping function to the original graph's values.
  async get(outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);

    let outerValue;
    if (this.preferExistingValue && innerKey !== outerKey) {
      // First check to see if the outer key already exists in the source graph.
      // If it does, we assume it's already been explicitly mapped, so we'll use
      // that value instead of mapping it ourselves.
      outerValue = await this.graph.get(outerKey);
    }
    if (outerValue === undefined && innerKey !== undefined) {
      // Ask inner graph for value.
      const innerValue = this.getValue
        ? await this.graph.get(innerKey)
        : undefined;

      // Determine whether we want to apply the map to this value.
      const applyMap =
        this.mapFn && (await this.mapApplies(innerValue, outerKey, innerKey));
      // Apply map if desired, otherwise use inner value as is.
      outerValue = applyMap
        ? await this.mapFn?.call(this, innerValue, outerKey, innerKey)
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

  async keys() {
    const keys = new Set();
    for (const innerKey of await this.graph.keys()) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        keys.add(outerKey);
      }
    }
    return keys;
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    // By default, we only apply the map to real values, or if we're not getting
    // a value.
    return innerValue !== undefined || !this.getValue;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey;
  }

  async unwatch() {
    return /** @type {any} */ (this.graph).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.graph).watch?.();
  }
}
