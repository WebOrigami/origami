import Graph from "./Graph.js";

export default class TransformGraph extends Graph {
  constructor(source, options = {}) {
    super();
    this.source = Graph.from(source);
    if (options.sourceKeyForVirtualKey) {
      this.sourceKeyForVirtualKey = options.sourceKeyForVirtualKey;
    }
    if (options.transform) {
      this.transform = options.transform;
    }
    if (options.virtualKeyForSourceKey) {
      this.virtualKeyForSourceKey = options.virtualKeyForSourceKey;
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const key of this.source) {
      const obj = this.virtualKeyForSourceKey(key);
      if (obj !== undefined) {
        yield obj;
      }
    }
  }

  async get(key) {
    const sourceKey = this.sourceKeyForVirtualKey(key);
    const obj = sourceKey ? await this.source.get(sourceKey) : null;
    return obj ? await this.transform(obj) : null;
  }

  sourceKeyForVirtualKey(key) {
    return key;
  }

  async transform(obj) {
    // The default implementation returns the object unmodified.
    return obj;
  }

  // TODO: default implementation calls enumerator?
  // Would need to be async then
  virtualKeyForSourceKey(key) {
    return key;
  }
}
