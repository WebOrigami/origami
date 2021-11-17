import ExplorableGraph from "../core/ExplorableGraph.js";

const splatKeySuffix1 = "...";
const splatKeySuffix2 = "…";

const splatGraphsKey = Symbol("splatGraphs");

export default function SplatKeysMixin(Base) {
  return class SplatKeys extends Base {
    constructor(...args) {
      super(...args);
      this[splatGraphsKey] = {};
    }

    async *[Symbol.asyncIterator]() {
      for await (const key of super[Symbol.asyncIterator]()) {
        if (isSplatKey(key)) {
          if (this[splatGraphsKey][key] === undefined) {
            const splatValue = await super.get2(key);
            this[splatGraphsKey][key] = ExplorableGraph.isExplorable(splatValue)
              ? splatValue
              : ExplorableGraph.from(splatValue);
          }
          // Return keys of splat graph in place of splat key.
          yield* this[splatGraphsKey][key];
        } else {
          yield key;
        }
      }
    }

    async get2(key) {
      const value = await super.get2(key);
      if (value !== undefined) {
        return value;
      }

      // Try looking in splat graphs.
      if (this[splatGraphsKey] === undefined) {
        // Force refresh
        // @ts-ignore
        for await (const key of this) {
        }
      }
      for (const splatGraphKeys in this[splatGraphsKey]) {
        const splatGraph = this[splatGraphsKey][splatGraphKeys];
        const innerValue = await splatGraph.get2(key);
        if (innerValue !== undefined) {
          return innerValue;
        }
      }
      return undefined;
    }
  };
}

function isSplatKey(key) {
  const text = String(key);
  return text.endsWith(splatKeySuffix1) || text.endsWith(splatKeySuffix2);
}
