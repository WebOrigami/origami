import { SyncMap } from "../../src/internal.js";

export default class ExtendedStandardMap extends SyncMap {
  constructor(source) {
    if ((source && !(source instanceof Map)) || source instanceof SyncMap) {
      throw new TypeError("ExtendedStandardMap: source must be a standard Map");
    }

    super();

    source ??= new Map();

    // Copy over properties from the source map that aren't SyncMap members
    for (const key of Object.keys(source)) {
      if (!(key in SyncMap.prototype)) {
        this[key] = source[key];
      }
    }

    this.source = source;
  }

  delete(key) {
    return this.source.delete(key);
  }

  get(key) {
    return this.source.get(key);
  }

  keys() {
    return this.source.keys();
  }

  set(key, value) {
    return this.source.set(key, value);
  }
}
