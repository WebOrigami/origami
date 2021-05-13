const keysJsonKey = ".keys.json";

export default function VirtualKeysMixin(Base) {
  return class VirtualKeys extends Base {

    // TODO: Make private
    // #virtualKeys;

    async *[Symbol.asyncIterator]() {
      if (this.virtualKeys === undefined) {
        // See if we have a .keys.json value.
        // REVIEW: We call super.get instead of this.get here. Otherwise, if we
        // use this mixin with WildcardKeysMixin, we can end up in a loop:
        // WildcardKeysMixin will want to get the keys, which will cause
        // VirtualKeysMixin to look for a .keys.json file, which would ask
        // WildcardKeysMixin to look for a file and (if it doesn't find one), look
        // through its keys for a wildcard -- resulting in a loop.
        const value = await super.get(keysJsonKey);

        if (value === undefined) {
          // No virtual keys
          this.virtualKeys = [];
        } else {
          // Virtual keys.
          this.virtualKeys =
            value instanceof Function
              ? await value.call(this)
              : value instanceof Buffer || value instanceof String
              ? JSON.parse(String(value))
              : value;
        }
      }

      // Yield the virtual keys, keeping track of what they are.
      const set = new Set();
      for (const key of this.virtualKeys) {
        set.add(key);
        yield key;
      }

      // Yield any additional keys in the graph, skipping keys that appeared in
      // the virtual keys.
      for await (const key of super[Symbol.asyncIterator]()) {
        if (!set.has(key)) {
          yield key;
        }
      }
    }
  };
}
