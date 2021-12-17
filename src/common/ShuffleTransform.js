export default function ShuffleTransform(Base) {
  return class Shuffle extends Base {
    async *[Symbol.asyncIterator]() {
      // Get base keys.
      const keys = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        keys.push(key);
      }

      // We use the keys array as a "hat" from which we draw random keys.
      // This is effectively a Fisher-Yates shuffle.
      while (keys.length > 0) {
        // Pick a random key from the hat.
        const index = Math.floor(Math.random() * keys.length);
        const key = keys[index];
        // Remove the key from the hat.
        keys.splice(index, 1);
        // Yield the key we picked.
        yield key;
      }
    }
  };
}
