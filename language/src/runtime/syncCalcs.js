import { SyncMap } from "@weborigami/async-tree";
import SyncCacheTransform from "./SyncCacheTransform.js";

export default function syncCalcs(iterable) {
  const data = new (SyncCacheTransform(SyncMap))(iterable);
  const calcs = new (SyncCacheTransform(SyncResultsMap))(data);
  return { calcs, data };
}

class SyncResultsMap extends SyncMap {
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
