import { Graph } from "@graphorigami/core";

export default class Scope {
  constructor(...variants) {
    const filtered = variants.filter((variant) => variant != undefined);
    const graphs = filtered.map((variant) => Graph.from(variant));

    // If a graph argument has a `graphs` property, use that instead.
    const scopes = graphs.flatMap(
      (graph) => /** @type {any} */ (graph).graphs ?? graph
    );

    this.graphs = scopes;
  }

  async get(key) {
    for (const graph of this.graphs) {
      const value = await graph.get(key);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  async keys() {
    const keys = new Set();
    for (const graph of this.graphs) {
      for (const key of await graph.keys()) {
        keys.add(key);
      }
    }
    return keys;
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
