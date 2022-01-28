export default function SortTransform(Base) {
  return class Sort extends Base {
    async *[Symbol.asyncIterator]() {
      const keys = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        keys.push(key);
      }
      keys.sort();
      yield* keys;
    }
  };
}
