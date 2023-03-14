import MapKeysValuesGraph from "../core/MapKeysValuesGraph.js";

export default class MapInnerKeysGraph extends MapKeysValuesGraph {
  constructor(variant, keyFn, options = {}) {
    super(variant, null, options);
    this.keyFn = keyFn;
    this.mapInnerKeyToOuterKey = new Map();
    this.mapOuterKeyToInnerKey = new Map();
  }

  // This is expensive, as we have to loop through all the keys in the inner
  // graph, get values, and map the value and inner key to an outer key. We
  // cache the result, so this is only done once per outer key.
  async innerKeyForOuterKey(outerKey) {
    if (!this.mapOuterKeyToInnerKey.has(outerKey)) {
      let innerKey = undefined;
      for (const key of await this.graph.keys()) {
        const mappedKey = await this.outerKeyForInnerKey(key);
        if (mappedKey === outerKey) {
          innerKey = mappedKey;
          break;
        }
      }
      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
    }
    return this.mapOuterKeyToInnerKey.get(outerKey);
  }

  onChange(key) {
    // super.onChange?.(key);
    this.mapInnerKeyToOuterKey.clear();
    this.mapOuterKeyToInnerKey.clear();
  }

  async outerKeyForInnerKey(innerKey) {
    if (!this.mapInnerKeyToOuterKey.has(innerKey)) {
      const value = await this.graph.get(innerKey);
      const outerKey =
        value !== undefined && this.keyFn
          ? await this.keyFn.call(this, value, innerKey)
          : value;
      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
      this.mapInnerKeyToOuterKey.set(innerKey, outerKey);
    }
    return this.mapInnerKeyToOuterKey.get(innerKey);
  }
}
