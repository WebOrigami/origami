import path from "path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";

const graphKey = Symbol("graph");
const mapFnKey = Symbol("mapFn");
const sourceExtensionKey = Symbol("sourceExtension");
const targetExtensionKey = Symbol("targetExtension");

/**
 * Given a graph and a function, return a new explorable graph that applies the
 * function to the original graph's values. If a source extension is specified,
 * only apply the transformation to keys that end with that extension. If a
 * target extension is specified, change the extension on the keys of the new
 * graph to that extension.
 */
export default class MapTypesGraph {
  /**
   * @param {GraphVariant} variant
   * @param {function} mapFn
   * @param {string} sourceExtension
   * @param {string} [targetExtension]
   */
  constructor(variant, mapFn, sourceExtension, targetExtension) {
    this[graphKey] = ExplorableGraph.from(variant);
    this[mapFnKey] = utilities.toFunction(mapFn);
    this[sourceExtensionKey] = sourceExtension.toLowerCase();
    this[targetExtensionKey] =
      targetExtension?.toLowerCase() ?? this[sourceExtensionKey];
  }

  async *[Symbol.asyncIterator]() {
    const keys = new Set();
    for await (const key of this[graphKey]) {
      const extension = path.extname(key).toLowerCase();
      const mappedKey =
        extension === this[sourceExtensionKey]
          ? `${path.basename(key, extension)}${this[targetExtensionKey]}`
          : key;
      if (!keys.has(mappedKey)) {
        keys.add(mappedKey);
        yield mappedKey;
      }
    }
  }

  // Apply the map function if the key matches the source extension.
  async get(key) {
    const applyMap =
      path.extname(key).toLowerCase() === this[targetExtensionKey];
    let value;
    if (applyMap) {
      // Asking for an extension that we map to.
      // Use regular get to get the value to map.
      const basename = path.basename(key, this[targetExtensionKey]);
      const sourceKey = `${basename}${this[sourceExtensionKey]}`;
      value = await this[graphKey].get(sourceKey);
      value = value
        ? await this[mapFnKey].call(this[graphKey], value, sourceKey, key)
        : undefined;
    } else {
      // Not an extension we handle.
      value = await this[graphKey].get(key);
    }

    return ExplorableGraph.isExplorable(value)
      ? // Return mapped subgraph
        new MapTypesGraph(
          value,
          this[mapFnKey],
          this[sourceExtensionKey],
          this[targetExtensionKey]
        )
      : value;
  }
}
