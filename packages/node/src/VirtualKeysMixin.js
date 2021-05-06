const keysJsonKey = ".keys.json";

export default function VirtualKeysMixin(Base) {
  return class VirtualKeys extends Base {
    async *[Symbol.asyncIterator]() {
      // Yield the parent graph's keys.
      yield* super[Symbol.asyncIterator]();

      // See if we have a .keys.json value.
      const value = await this.get(keysJsonKey);
      if (value) {
        // Yield the value (which should be an array) as keys.
        const data =
          value instanceof Buffer || value instanceof String
            ? JSON.parse(String(value))
            : value;
        yield* data;
      }
    }
  };
}
