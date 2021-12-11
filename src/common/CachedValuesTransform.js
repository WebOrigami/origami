const cacheKey = Symbol("cache");

export default function CachedValuesTransform(Base) {
  return class CachedValues extends Base {
    constructor(...args) {
      super(...args);
      this[cacheKey] = new WeakRefCache();
    }

    async get(key) {
      const cached = this[cacheKey].get(key);
      if (cached) {
        return cached;
      }
      const result = await super.get(key);
      this[cacheKey].set(key, result);
      return result;
    }

    onChange(eventType, filename) {
      super.onChange(eventType, filename);
      this[cacheKey] = new WeakRefCache();
    }
  };
}

// Cache that can hold weak references. This is similar to WeakMap, but also
// allows for non-object keys, particularly strings.
class WeakRefCache {
  #objectKeyCache = new WeakMap();
  #stringKeyCache = {};

  get(key) {
    if (typeof key === "object") {
      return this.#objectKeyCache.get(key);
    } else {
      const ref = this.#stringKeyCache[key];
      const value = ref instanceof WeakRef ? ref.deref() : ref;
      return value;
    }
  }

  set(key, value) {
    if (typeof key === "object") {
      this.#objectKeyCache.set(key, value);
    } else {
      const ref = typeof value === "object" ? new WeakRef(value) : value;
      this.#stringKeyCache[key] = ref;
    }
  }
}
