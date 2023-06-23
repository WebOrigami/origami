import GraphHelpers from "./GraphHelpers.js";
import ObjectDictionary from "./ObjectDictionary.js";

/**
 * A graph defined by a plain object or array.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableGraph} AsyncMutableGraph
 * @implements {AsyncMutableGraph}
 */
export default class ObjectGraph extends ObjectDictionary {
  async get(key) {
    let value = await super.get(key);
    if (GraphHelpers.isPlainObject(value)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  async isKeyForSubgraph(key) {
    const value = this.object[key];
    return GraphHelpers.isGraphable(value);
  }
}
