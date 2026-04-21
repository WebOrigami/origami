import { AsyncMap, SyncMap } from "@weborigami/async-tree";
import AsyncCacheTransform from "./AsyncCacheTransform.js";
import SyncCacheTransform from "./SyncCacheTransform.js";

export default function asyncCalcs(iterable) {
  const data = new (SyncCacheTransform(SyncMap))(iterable);
  const calcs = new (AsyncCacheTransform(AsyncResultsMap))(data);
  return { calcs, data };
}

class AsyncResultsMap extends AsyncMap {
  constructor(source) {
    super();
    this.source = source;
  }

  async get(key) {
    let value = this.source.get(key);
    if (typeof value === "function") {
      value = await value();
    }
    return value;
  }

  async *keys() {
    yield* this.source.keys();
  }
}
