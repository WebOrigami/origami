import { ExplorableGraph } from "../../core/exports.js";

const keysJsonKey = ".keys.json";

export default class VirtualKeys extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = inner;
  }

  async *[Symbol.asyncIterator]() {
    // Yield the inner graph's keys.
    // For virtual files, return virtual name instead of actual name.
    yield* this.inner[Symbol.asyncIterator]();

    // See if we have a .keys.json value.
    const value = await this.inner.get(keysJsonKey);
    if (value) {
      // Yield the value (which should be an array) as keys.
      const data =
        value instanceof Buffer || value instanceof String
          ? JSON.parse(String(value))
          : value;
      yield* data;
    }
  }

  async get(...path) {
    return await this.inner.get(...path);
  }

  // Feels hacky
  get path() {
    return this.inner.path;
  }
}
