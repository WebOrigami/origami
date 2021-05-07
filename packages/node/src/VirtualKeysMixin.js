const keysJsonKey = ".keys.json";

export default function VirtualKeysMixin(Base) {
  return class VirtualKeys extends Base {
    async *[Symbol.asyncIterator]() {
      // Yield the parent graph's keys.
      yield* super[Symbol.asyncIterator]();

      // See if we have a .keys.json value.
      // REVIEW: We call super.get instead of this.get here. Otherwise, if we
      // use this mixin with WildcardKeysMixin, we can end up in a loop:
      // WildcardKeysMixin will want to get the keys, which will cause
      // VirtualKeysMixin to look for a .keys.json file, which would ask
      // WildcardKeysMixin to look for a file and (if it doesn't find one), look
      // through its keys for a wildcard -- resulting in a loop.
      const value = await super.get(keysJsonKey);

      if (value !== undefined) {
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
