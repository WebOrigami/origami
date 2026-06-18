import { SyncMap } from "@weborigami/async-tree";
import SyncCacheTransform from "../../src/runtime/SyncCacheTransform.js";

export default function syncCalcs(iterable) {
  const data = new (SyncCacheTransform(SyncDataMap))(new Map(iterable));
  const calcs = new (SyncCacheTransform(SyncCalcsMap))(data);
  return { calcs, data };
}

class SyncDataMap extends SyncMap {
  constructor(source) {
    super();
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

class SyncCalcsMap extends SyncMap {
  constructor(source) {
    super();
    this.source = source;
  }

  get(key) {
    let value = this.source.get(key);
    if (typeof value === "function") {
      value = value();
    }
    return value;
  }

  keys() {
    return this.source.keys();
  }
}
