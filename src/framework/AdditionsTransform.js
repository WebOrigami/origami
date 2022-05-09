import ExplorableGraph from "../core/ExplorableGraph.js";

export const additionsKey = "+";
const additions = Symbol("additions");

export default function AdditionsTransform(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[additions] = undefined;
    }

    async additions() {
      if (!this.listeningForChanges || this[additions] === undefined) {
        const variant = await super.get(additionsKey);
        this[additions] = variant ? ExplorableGraph.from(variant) : null;
      }
      return this[additions];
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      // If FormulasTransform is applied, it will have already yielded the
      // addition's keys. If the graph has no `formulas` property, we conclude
      // FormualsTransform has *not* been applied, so yield the keys ourselves.
      if (!this.formulas) {
        const additions = await this.additions();
        if (additions) {
          yield* additions;
        }
      }
    }

    async get(key) {
      let result = await super.get(key);
      if (result === undefined) {
        // Not found locally, check additions.
        const additions = await this.additions();
        result = await additions?.get(key);
      }
      return result;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      if (super.onChange) {
        super.onChange(eventType, filename);
      }
      this[additions] = undefined;
    }
  };
}
