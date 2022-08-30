import { sortNatural } from "../core/utilities.js";

const publicKeys = Symbol("publicKeys");
const realKeys = Symbol("realKeys");
const allKeys = Symbol("allKeys");
const newKeyQueue = Symbol("newKeyQueue");

export default function KeysTransform(Base) {
  return class Keys extends Base {
    constructor(...args) {
      super(...args);
      this[allKeys] = null;
      this[publicKeys] = null;
      this[realKeys] = null;
      this[newKeyQueue] = [];
    }

    async *[Symbol.asyncIterator]() {
      if (!this[publicKeys]) {
        await this.getKeys();
      }
      yield* this[publicKeys];
    }

    addKey(key, options = {}) {
      const entry = {
        key,
        virtual: options.virtual ?? true,
        hidden: options.hidden ?? false,
      };
      this[newKeyQueue].push(entry);
    }

    async allKeys() {
      if (!this[allKeys]) {
        await this.getKeys();
      }
      return this[allKeys];
    }

    async getKeys() {
      this[allKeys] = [];
      this[publicKeys] = [];
      this[realKeys] = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        this.addKey(key, { virtual: false });
      }

      while (this[newKeyQueue].length > 0) {
        const { key, virtual, hidden } = this[newKeyQueue].shift();
        const options = await this.keyAdded(key, { virtual, hidden });
        this[allKeys].push(key);
        if (!options.virtual) {
          this[realKeys].push(key);
        }
        if (!options.hidden) {
          this[publicKeys].push(key);
        }
      }

      // REVIEW: Should sortNatural sort in place?
      this[realKeys] = sortNatural(this[realKeys]);
      this[publicKeys] = sortNatural(this[publicKeys]);
      this[allKeys] = sortNatural(this[allKeys]);
    }

    async keyAdded(key, options) {
      return super.keyAdded?.(key) ?? options;
    }

    onChange(key) {
      super.onChange?.(key);
      this[allKeys] = null;
      this[publicKeys] = null;
      this[realKeys] = null;
      this[newKeyQueue] = [];
    }

    async publicKeys() {
      if (!this[publicKeys]) {
        await this.getKeys();
      }
      return this[publicKeys];
    }

    async realKeys() {
      if (!this[realKeys]) {
        await this.getKeys();
      }
      return this[realKeys];
    }
  };
}
