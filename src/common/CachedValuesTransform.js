const cacheKey = Symbol("cache");

export default function CachedValuesTransform(Base) {
  return class CachedValues extends Base {
    constructor(...args) {
      super(...args);
      this[cacheKey] = new Map();
    }

    async get(key) {
      const cachable = this.isKeyCachable(key);
      if (cachable) {
        const cached = this[cacheKey].get(key);
        if (cached) {
          return cached;
        }
      }

      const result = await super.get(key);
      if (cachable) {
        this[cacheKey].set(key, result);
      }

      return result;
    }

    isKeyCachable(key) {
      return super.isCacheable?.(key) ?? true;
    }

    onChange(key) {
      super.onChange?.(key);
      this[cacheKey] = new Map();
    }

    async set(key, value) {
      this[cacheKey].delete(key);
      return super.set(key, value);
    }
  };
}
