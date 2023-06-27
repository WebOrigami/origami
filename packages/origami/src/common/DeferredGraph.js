import { getScope, keySymbol } from "../common/utilities.js";
import Scope from "./Scope.js";

/**
 * A graph that is loaded lazily.
 *
 * This is useful in situations like a toGraph() function, which is expected to
 * return a graph synchronously. If constructing the graph requires an
 * asynchronous operation, this class can be used as a wrapper that can be
 * returned immediately. When the graph's keys or get functions are called, the
 * graph will be loaded as necessary.
 */
export default class DeferredGraph {
  constructor(loadFn) {
    this.deferredParent = null;
    this._graph = null;
    this.loadFn = loadFn;
    this.loadPromise = null;
  }

  async get(key) {
    const loaded = await this.load();
    return loaded?.get(key);
  }

  async keys() {
    const loaded = await this.load();
    return loaded.keys();
  }

  async load() {
    // We use a promise to ensure that the load function is only invoked once.
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Invoke the load function.
    let loadResult = this.loadFn();

    // Cast the result to a promise if it isn't one.
    if (!("then" in loadResult)) {
      loadResult = Promise.resolve(loadResult);
    }

    // Arrange to set the parent of the graph once it's loaded.
    this.loadPromise = loadResult.then((graph) => {
      if (this.deferredParent) {
        if ("parent" in graph) {
          graph.parent = this.deferredParent;
        }
        this.deferredParent = null;
      }
      this._graph = graph;
      if (!this[keySymbol]) {
        this[keySymbol] = graph[keySymbol];
      }
      return graph;
    });

    return this.loadPromise;
  }

  get parent() {
    return this.deferredParent ?? /** @type {any} */ (this._graph)?.parent;
  }
  set parent(parent) {
    if (!this._graph) {
      // Not ready to set the parent yet.
      this.deferredParent = parent;
    } else {
      // Avoid destructive modification of the underlying graph.
      this._graph = Object.create(this._graph);
      /** @type {any} */ (this._graph).parent = parent;
    }
  }

  get scope() {
    return this.parent ? new Scope(this, getScope(this.parent)) : this;
  }
}
