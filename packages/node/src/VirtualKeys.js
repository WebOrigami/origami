import { ExplorableGraph } from "../../core/exports.js";

const keysJsonKey = ".keys.json";

export default class VirtualKeys extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = inner;
  }

  async *[Symbol.asyncIterator]() {
    // See if we have a .keys.json value.
    const value = await this.inner.get(keysJsonKey);
    if (value) {
      // Return the keys in the value.
      const data =
        value instanceof Buffer || value instanceof String
          ? JSON.parse(String(value))
          : value;
      yield* data;
    } else {
      // Use the inner graph's keys.
      // For virtual files, return virtual name instead of actual name.
      yield* this.inner[Symbol.asyncIterator]();
    }
  }

  async get(...path) {
    return await this.inner.get(...path);
  }
}
