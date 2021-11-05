import ExplorableGraph from "../core/ExplorableGraph.js";

export default function ShuffleMixin(Base) {
  return class Shuffle extends Base {
    async *[Symbol.asyncIterator]() {
      const keys = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        keys.push(key);
      }

      const length = keys.length;
      for (let i = 0; i < length; i++) {
        // Pick a random index from the remaining keys.
        const index = Math.floor(Math.random() * keys.length);
        const key = keys[index];
        // Remove the key from the remaining keys.
        keys.splice(index, 1);
        yield key;
      }
    }

    async get(key, ...rest) {
      let value = await super.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        if (rest.length > 0) {
          value = await value.get(...rest);
        }
      }
      return value;
    }
  };
}
