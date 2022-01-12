import path from "path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";

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
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
    this.sourceExtension = sourceExtension.toLowerCase();
    this.targetExtension =
      targetExtension?.toLowerCase() ?? this.sourceExtension;
  }

  async *[Symbol.asyncIterator]() {
    const keys = new Set();
    for await (const key of this.graph) {
      const extension = path.extname(key).toLowerCase();
      const mappedKey =
        extension === this.sourceExtension
          ? `${path.basename(key, extension)}${this.targetExtension}`
          : key;
      if (!keys.has(mappedKey)) {
        keys.add(mappedKey);
        yield mappedKey;
      }
    }
  }

  // Apply the map function if the key matches the source extension.
  async get(key) {
    let value;
    // See if the key matches the source extension. We use a cruder but more
    // general interpretation of "extension" to mean any suffix, rather than
    // Node's `path` interpretation in extname. In particular, we want to be
    // able to match an "extension" like ".foo.bar" that contains more than one
    // dot.
    const applyMap = key.toLowerCase().endsWith(this.targetExtension);
    if (applyMap) {
      // Asking for an extension that we map to.
      const basename = key.slice(0, -this.targetExtension.length);
      const sourceKey = `${basename}${this.sourceExtension}`;
      // Use regular `get` to get the value to map.
      value = await this.graph.get(sourceKey);
      if (value) {
        // Apply map function.
        value = await this.mapFn.call(this.graph, value, sourceKey, key);
      }
    }

    // If the key didn't match, or we couldn't get the source value, see if the
    // key exists as is.
    if (value === undefined) {
      value = await this.graph.get(key);
    }

    return ExplorableGraph.isExplorable(value)
      ? // Return mapped subgraph
        Reflect.construct(this.constructor, [
          value,
          this.mapFn,
          this.sourceExtension,
          this.targetExtension,
        ])
      : value;
  }

  get scope() {
    return /** @type {any} */ (this.graph).scope;
  }
}