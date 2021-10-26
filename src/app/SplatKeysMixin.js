import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";

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
            const splatValue = await super.get(key);
            // TODO: Use ExplorableGraph.from()
            this.#splatGraphs[key] = ExplorableGraph.isExplorable(splatValue)
              ? splatValue
              : new ExplorableObject(splatValue);
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
        // @ts-ignore
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
