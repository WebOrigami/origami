import { keySymbol } from "../core/utilities.js";
import Scope from "./Scope.js";

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
    this.deferredParent = null;
    this.graph = null;
    this.loadFn = loadFn;
    this.loadPromise = null;
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
    if (this.loadPromise) {
      return this.loadPromise;
    }
    this.loadPromise = new Promise(async (resolve) => {
      const graph = await this.loadFn();
      if (this.deferredParent) {
        if ("parent" in graph) {
          graph.parent = this.deferredParent;
        }
        this.deferredParent = null;
      }
      this.graph = graph;
      if (!this[keySymbol]) {
        this[keySymbol] = graph[keySymbol];
      }
      resolve(graph);
    });
    return this.loadPromise;
  }

  get parent() {
    return this.deferredParent ?? /** @type {any} */ (this.graph)?.parent;
  }
  set parent(parent) {
    if (!this.graph) {
      // Not ready to set the parent yet.
      this.deferredParent = parent;
    } else {
      // Avoid destructive modification of the underlying graph.
      this.graph = Object.create(this.graph);
      /** @type {any} */ (this.graph).parent = parent;
    }
  }

  get scope() {
    const parent = this.parent;
    const parentScope = parent?.scope ?? parent;
    return new Scope(this, parentScope);
  }
}
