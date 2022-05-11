const cacheKey = Symbol("cache");

export default function CachedValuesTransform(Base) {
  return class CachedValues extends Base {
    constructor(...args) {
      super(...args);
      this[cacheKey] = new Map();
    }

    async get(key) {
      const ref = this[cacheKey].get(key);
      let value = ref?.deref();
      if (value !== undefined) {
        return value;
      }
      value = await super.get(key);
      if (value !== undefined && typeof value === "object") {
        this[cacheKey].set(key, new WeakRef(value));
      }
      return value;
    }

    onChange(eventType, filename) {
      super.onChange(eventType, filename);
      this[cacheKey] = new Map();
    }
  };
}
