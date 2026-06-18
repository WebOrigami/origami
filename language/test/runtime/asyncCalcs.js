import { AsyncMap } from "@weborigami/async-tree";
import AsyncCacheTransform from "../../src/runtime/AsyncCacheTransform.js";

export default function asyncCalcs(iterable) {
  const data = new (AsyncCacheTransform(AsyncDataMap))(new Map(iterable));
  const calcs = new (AsyncCacheTransform(AsyncResultsMap))(data);
  return { calcs, data };
}

class AsyncDataMap extends AsyncMap {
  constructor(source) {
    super();
    this.source = source;
  }

  async delete(key) {
    return this.source.delete(key);
  }

  async get(key) {
    return this.source.get(key);
  }

  async *keys() {
    yield* this.source.keys();
  }

  async set(key, value) {
    return this.source.set(key, value);
  }
}

class AsyncResultsMap extends AsyncMap {
  constructor(source) {
    super();
    this.source = source;
  }

  async get(key) {
    let value = await this.source.get(key);
    if (typeof value === "function") {
      value = await value();
    }
    return value;
  }

  async *keys() {
    yield* this.source.keys();
  }
}
