import Graph from "./Graph.js";

export default class GraphTransform extends Graph {
  constructor(source, options = {}) {
    super();
    this.source = Graph.from(source);
    if (options.exposedKeyForSourceKey) {
      this.exposedKeyForSourceKey = toFunction(options.exposedKeyForSourceKey);
    }
    if (options.sourceKeyForExposedKey) {
      this.sourceKeyForExposedKey = toFunction(options.sourceKeyForExposedKey);
    }
    if (options.transformObject) {
      this.transformObject = toFunction(options.transformObject);
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const sourceKey of this.source) {
      const exposedKey = await this.exposedKeyForSourceKey(sourceKey);
      if (exposedKey !== undefined) {
        yield exposedKey;
      }
    }
  }

  async get(key) {
    const sourceKey = await this.sourceKeyForExposedKey(key);
    const obj = sourceKey ? await this.source.get(sourceKey) : undefined;
    return obj ? await this.transformObject(obj) : undefined;
  }

  // The default implementation exposes the same keys as the source.
  async exposedKeyForSourceKey(sourceKey) {
    return sourceKey;
  }

  // The default implementation assumes the source uses the same keys.
  async sourceKeyForExposedKey(exposedKey) {
    return exposedKey;
  }

  // The default implementation returns the object unmodified.
  async transformObject(obj) {
    return obj;
  }
}

// Cast the given object to a function.
// If it's a function already, return as is.
// If it's a graph, return a function that returns an object from the graph.
function toFunction(x) {
  if (typeof x === "function") {
    return x;
  }
  const graph = Graph.from(x);
  return (key) => graph.get(key);
}
