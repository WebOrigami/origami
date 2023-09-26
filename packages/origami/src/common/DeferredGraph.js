import { Graph } from "@graphorigami/core";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";
import {
  getScope,
  isTransformApplied,
  keySymbol,
  transformObject,
} from "./utilities.js";

/**
 * A graph that is loaded lazily.
 *
 * This is useful in situations where a graph must be returned synchronously but
 * constructing the graph requires an asynchronous operation. In such cases,
 * this class can be used as a wrapper that can be returned immediately. When
 * the graph's keys or get functions are called, the graph will be loaded as
 * necessary.
 */
export default class DeferredGraph {
  constructor(loadFn) {
    this._parent = null;
    this._graph = null;
    this.loadFn = loadFn;
    this.loadPromise = null;
    this.loadResult = null;
  }

  async get(key) {
    await this.load();
    return key === Graph.defaultValueKey
      ? this.loadResult
      : this.graph.get(key);
  }

  get graph() {
    if (!this._graph) {
      let result = this.loadResult;
      const parent = this.parent;

      if (typeof result === "function" && parent) {
        // This graph will be a FunctionGraph based on a function, but we need
        // to avoid recursion. When a FunctionGraph calls its function, the
        // function's context (the `this` inside the function call) will be the
        // FunctionGraph. The FunctionGraph's scope will end up including the
        // FunctionGraph itself. If the function does anything to search its
        // scope via `this.get()`, it would end up calling the function again
        // recursively. To avoid recursion, we proactively bind the function to
        // the parent's scope. Note: if someone gets the direct function via
        // `get(defaultValueKey)`, that will return the unbound function.
        result = result.bind(getScope(parent));
      }

      let graph = Graph.from(Graph.makeGraphable(result));

      if (parent) {
        if (!isTransformApplied(InheritScopeTransform, graph)) {
          graph = transformObject(InheritScopeTransform, graph);
        }
        /** @type {any} */ (graph).parent = parent;
      }

      this._graph = graph;
    }
    return this._graph;
  }

  async keys() {
    await this.load();
    return this.graph.keys();
  }

  async load() {
    // We use a promise to ensure that the load function is only invoked once.
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Invoke the load function, casting the result to a promise if it isn't
    // one. Arrange to process and save the result once it's loaded.
    this.loadPromise = Promise.resolve(this.loadFn()).then((result) => {
      if (result === undefined) {
        throw TypeError(
          "The deferred graph's load function didn't return a graph."
        );
      }
      this.loadResult = result;
      if (result[keySymbol] && !this[keySymbol]) {
        this[keySymbol] = result[keySymbol];
      }
    });

    return this.loadPromise;
  }

  get parent() {
    return this._parent;
  }
  set parent(parent) {
    this._parent = parent;
    // Force recreation of the graph the next time it's requested.
    this._graph = null;
  }

  get scope() {
    return this.parent ? new Scope(this, getScope(this.parent)) : this;
  }
}
