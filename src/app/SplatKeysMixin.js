import ExplorableGraph from "../core/ExplorableGraph.js";

const splatKey = "...";

export default function SplatKeysMixin(Base) {
  return class SplatKeys extends Base {
    #splatGraph;

    async *[Symbol.asyncIterator]() {
      for await (const key of super[Symbol.asyncIterator]()) {
        if (key !== splatKey) {
          yield key;
        }
      }
      if (this.#splatGraph === undefined) {
        await this.refresh();
      }
      if (this.#splatGraph) {
        for await (const key of this.#splatGraph) {
          yield key;
        }
      }
    }

    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      // Try looking in splat graph.
      if (this.#splatGraph === undefined) {
        await this.refresh();
      }
      return this.#splatGraph ? await this.#splatGraph.get(...keys) : undefined;
    }

    async refresh() {
      const splatValue = await super.get(splatKey);
      if (ExplorableGraph.isExplorable(splatValue)) {
        this.#splatGraph = splatValue;
      }
    }
  };
}
