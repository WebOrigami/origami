import AsyncMap from "../src/drivers/AsyncMap.js";
import * as trailingSlash from "../src/trailingSlash.js";

/**
 * For testing AsyncMaps
 */
export default class SampleAsyncMap extends AsyncMap {
  constructor(entries) {
    super();
    this.map = new Map(entries);
  }

  async delete(key) {
    const normalized = trailingSlash.remove(key);
    return this.map.delete(normalized);
  }

  async get(key) {
    let value = this.map.get(key);
    if (value instanceof Array) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  async *keys() {
    yield* this.map.keys();
  }

  async set(key, value) {
    this.map.set(key, value);
    return this;
  }
}
