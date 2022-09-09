import ExplorableGraph from "../core/ExplorableGraph.js";
import { sortNatural } from "../core/utilities.js";

const addedKeys = Symbol("addedKeys");
const allKeys = Symbol("allKeys");
const keysPromise = Symbol("keysPromise");
const newKeyQueue = Symbol("newKeyQueue");
const publicKeys = Symbol("publicKeys");
const realKeys = Symbol("realKeys");

export default function KeysTransform(Base) {
  return class Keys extends Base {
    constructor(...args) {
      super(...args);
      this[addedKeys] = null;
      this[allKeys] = null;
      this[keysPromise] = null;
      this[newKeyQueue] = null;
      this[publicKeys] = null;
      this[realKeys] = null;
    }

    addKey(key, options = {}) {
      const defaults = {
        virtual: true,
        hidden: false,
      };
      const entry = { key, ...defaults, ...options };
      if (!this[addedKeys].has(key)) {
        this[newKeyQueue].push(entry);
        this[addedKeys].add(key);
      }
    }

    async allKeys() {
      await this.ensureKeys();
      return this[allKeys];
    }

    async *[Symbol.asyncIterator]() {
      await this.ensureKeys();
      yield* this[publicKeys];
    }

    async ensureKeys() {
      if (!this[keysPromise]) {
        this[keysPromise] = this.getKeys();
      }
      return this[keysPromise];
    }

    async getKeys() {
      this[allKeys] = [];
      this[publicKeys] = [];
      this[realKeys] = [];
      this[newKeyQueue] = [];
      this[addedKeys] = new Set();
      for await (const key of super[Symbol.asyncIterator]()) {
        this.addKey(key, { virtual: false });
      }

      for (
        let length = -1;
        length !== this[allKeys].length || this[newKeyQueue].length > 0;

      ) {
        length = this[allKeys].length;

        const keysThisCycle = [];

        while (this[newKeyQueue].length > 0) {
          const entry = this[newKeyQueue].shift();
          const key = entry.key;
          const entryOptions = { ...entry };
          delete entryOptions.key;
          const options = await this.keyAdded(key, entryOptions, this[allKeys]);

          keysThisCycle.push(key);

          const virtual = options?.virtual ?? entry.virtual;
          if (!virtual) {
            this[realKeys].push(key);
          }

          const hidden = options?.hidden ?? entry.hidden;
          if (!hidden) {
            this[publicKeys].push(key);
          }
        }

        this[allKeys].push(...keysThisCycle);

        // Allow transforms to cope with new keys. We do this even if there are
        // no new keys this cycle; a transform may have other sources of keys.
        await this.keysAdded(keysThisCycle);
      }

      // REVIEW: Should sortNatural sort in place?
      this[realKeys] = sortNatural(this[realKeys]);
      this[publicKeys] = sortNatural(this[publicKeys]);
      this[allKeys] = sortNatural(this[allKeys]);
    }

    async keyAdded(key, options, existingKeys) {
      return super.keyAdded?.(key, options, existingKeys);
    }

    async keysAdded(newKeys) {
      return super.keysAdded?.(newKeys);
    }

    onChange(key) {
      super.onChange?.(key);
      this[addedKeys] = null;
      this[allKeys] = null;
      this[keysPromise] = null;
      this[newKeyQueue] = null;
      this[publicKeys] = null;
      this[realKeys] = null;
    }

    async publicKeys() {
      await this.ensureKeys();
      return this[publicKeys];
    }

    async realKeys() {
      await this.ensureKeys();
      return this[realKeys];
    }
  };
}

// Static helper: use realKeys if defined, otherwise asyncIterator.
KeysTransform.realKeys = async (graph) => {
  return graph.realKeys?.() ?? ExplorableGraph.keys(graph);
};
