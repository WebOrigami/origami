import ExplorableGraph from "../core/ExplorableGraph.js";

export const additionsKey = "+";
const additions = Symbol("additions");

// This flag is used to prevent infinite loops while getting the additions.
const gettingAdditions = Symbol("gettingAdditions");

export default function AdditionsTransform(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[additions] = undefined;
      this[gettingAdditions] = false;
    }

    async additions() {
      if (/* !this.listeningForChanges || */ this[additions] === undefined) {
        // If additions are defined in a metagraph, that will require us to get
        // other values from this graph (e.g., to retrieve a definition for
        // `meta`). To avoid an infinite loop, we set a flag to indicate that
        // we're in the process of getting additions. During that process, the
        // get method will be able to get other things, but not additions.
        this[gettingAdditions] = true;
        const variant = await super.get(additionsKey);
        this[additions] = variant ? ExplorableGraph.from(variant) : null;
        this[gettingAdditions] = false;
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
      if (
        result === undefined &&
        key !== additionsKey &&
        !this[gettingAdditions]
      ) {
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
