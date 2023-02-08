/**
 * A graph that is loaded lazily.
 *
 * This is useful in situations like a toGraph() function, which is expected to
 * return a graph synchronously. If constructing the graph requires an
 * asynchronous operation, this class can be used as a wrapper that can be
 * returned immediately. When the graph's asyncIterator or get functions are
 * called, the graph will be loaded as necessary.
 */
export default class DeferredGraph {
  constructor(loadFn) {
    this.graph = null;
    this.loadFn = loadFn;
  }

  async *[Symbol.asyncIterator]() {
    const loaded = await this.load();
    yield* loaded ?? [];
  }

  async get(key) {
    const loaded = await this.load();
    return loaded?.get(key);
  }

  async load() {
    if (!this.graph) {
      this.graph = await this.loadFn();
    }
    return this.graph;
  }
}
