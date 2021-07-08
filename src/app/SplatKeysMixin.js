const splatKeySuffix = "...";

export default function SplatKeysMixin(Base) {
  return class SplatKeys extends Base {
    #splatGraphs;

    async *[Symbol.asyncIterator]() {
      let updateSplatGraphs = this.#splatGraphs === undefined;
      if (updateSplatGraphs) {
        this.#splatGraphs = {};
      }
      const results = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        const isSplatKey = key.endsWith(splatKeySuffix);
        if (isSplatKey) {
          if (this.#splatGraphs[key] === undefined) {
            this.#splatGraphs[key] = await super.get(key);
          }
          // Return keys of splat graph in place of splat key.
          for await (const innerKey of this.#splatGraphs[key]) {
            results.push(innerKey);
          }
        } else {
          results.push(key);
        }
      }
      yield* results;
    }

    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      // Try looking in splat graphs.
      if (this.#splatGraphs === undefined) {
        // Force refresh
        for await (const key of this) {
        }
      }
      for (const splatGraphKeys in this.#splatGraphs) {
        const splatGraph = this.#splatGraphs[splatGraphKeys];
        const innerValue = await splatGraph.get(...keys);
        if (innerValue !== undefined) {
          return innerValue;
        }
      }
      return undefined;
    }
  };
}
