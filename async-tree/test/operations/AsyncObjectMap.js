import AsyncMap from "../../src/drivers/AsyncMap.js";

/**
 * For testing AsyncMaps
 */
export default class AsyncObjectMap extends AsyncMap {
  constructor(iterable) {
    super();
    this.map = new Map(iterable);
  }

  async get(key) {
    return this.map.get(key);
  }

  async *keys() {
    yield* this.map.keys();
  }
}
