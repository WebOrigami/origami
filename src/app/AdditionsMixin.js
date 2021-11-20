export const additionsKey = "+";
const additions = Symbol("additions");

export default function AdditionsMixin(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[additions] = undefined;
    }

    async additions() {
      if (this[additions] === undefined) {
        this[additions] = (await super.get(additionsKey)) || null;
      }
      return this[additions];
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      const additions = await this.additions();
      if (additions) {
        yield* additions;
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
