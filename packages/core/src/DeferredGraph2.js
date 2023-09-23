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
    this.graphable = null;
    this.loader = loader;
    this.loadPromise = null;
  }

  async get(key) {
    return key === Graph.defaultValueKey
      ? this.graphable
      : (await this.graph()).get(key);
  }

  async keys() {
    return (await this.graph()).keys();
  }

  async graph() {
    // We use a promise to ensure that the load function is only invoked once.
    if (!this.loadPromise) {
      // Invoke the load function, casting the result to a promise if it isn't
      // one. Arrange to process and save the result once it's loaded.
      const result =
        this.loader instanceof Promise ? this.loader : this.loader();
      this.loadPromise = Promise.resolve(result).then((graphable) => {
        this.graphable = graphable;
        return Graph.from(graphable);
      });
    }
    return this.loadPromise;
  }
}
