import * as Graph from "./Graph.js";

/**
 * A graph that is loaded lazily.
 *
 * This is useful in situations that must return a graph synchronously. If
 * constructing the graph requires an asynchronous operation, this class can be
 * used as a wrapper that can be returned immediately. The graph will be loaded
 * the first time the keys() or get() functions are called.
 */
export default class DeferredGraph2 {
  /**
   *
   * @param {Function|Promise<any>} loader
   */
  constructor(loader) {
    this.loader = loader;
    this.graphPromise = null;
  }

  async get(key) {
    return key === Graph.defaultValueKey
      ? this.graphable()
      : (await this.graph()).get(key);
  }

  async keys() {
    return (await this.graph()).keys();
  }

  async graph() {
    // Use a promise to ensure that the graphable is only converted to a graph
    // once.
    if (!this.graphPromise) {
      this.graphPromise = this.graphable().then((graphable) =>
        Graph.from(graphable)
      );
    }
    return this.graphPromise;
  }

  async graphable() {
    if (!(this.loader instanceof Promise)) {
      this.loader = this.loader();
    }
    return this.loader;
  }
}
