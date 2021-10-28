import ExplorableGraph from "../core/ExplorableGraph.js";

const splatKeySuffix1 = "...";
const splatKeySuffix2 = "…";

export default function SplatKeysMixin(Base) {
  return class SplatKeys extends Base {
    #splatGraphs;

    async *[Symbol.asyncIterator]() {
      if (this.#splatGraphs === undefined) {
        this.#splatGraphs = {};
      }
      for await (const key of super[Symbol.asyncIterator]()) {
        if (isSplatKey(key)) {
          if (this.#splatGraphs[key] === undefined) {
            const splatValue = await super.get(key);
            this.#splatGraphs[key] = ExplorableGraph.isExplorable(splatValue)
              ? splatValue
              : ExplorableGraph.from(splatValue);
          }
          // Return keys of splat graph in place of splat key.
          yield* this.#splatGraphs[key];
        } else {
          yield key;
        }
      }
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

function isSplatKey(key) {
  return key.endsWith(splatKeySuffix1) || key.endsWith(splatKeySuffix2);
}
