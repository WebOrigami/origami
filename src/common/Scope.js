import ExplorableGraph from "../core/ExplorableGraph.js";

export default class Scope {
  constructor(...variants) {
    const filtered = variants.filter((variant) => variant != undefined);
    const graphs = filtered.map((variant) => ExplorableGraph.from(variant));

    // If a graph argument has a `graphs` property, use that instead.
    const scopes = graphs.flatMap(
      (graph) => /** @type {any} */ (graph).graphs ?? graph
    );

    this.graphs = scopes;
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (!set.has(key)) {
          set.add(key);
          yield key;
        }
      }
    }
  }

  async get(key) {
    for (const graph of this.graphs) {
      const value = await graph.get(key);
      if (value instanceof Function) {
        // When returning a function, we want to adjust it so that, if it's
        // called without a call target (`this`), we'll invoke it using this
        // scope as the call target.
        //
        // We do this by returning a Proxy for the function. Beyond letting us
        // intercept the function call, it also: 1) returns the correct `length`
        // property for the function, which is necessary for FunctionGraph to
        // work correctly, and 2) allows us to access any properties hanging off
        // the function, such as documentation used by the ori CLI.
        const scope = this;
        const proxy = new Proxy(value, {
          apply(target, thisArg, args) {
            return Reflect.apply(target, thisArg ?? scope, args);
          },
        });
        return proxy;
      } else if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  async unwatch() {
    for (const graph of this.graphs) {
      await /** @type {any} */ (graph).unwatch?.();
    }
  }
  async watch() {
    for (const graph of this.graphs) {
      await /** @type {any} */ (graph).watch?.();
    }
  }
}
