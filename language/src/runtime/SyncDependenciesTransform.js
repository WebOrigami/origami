import { cachePathSymbol } from "./symbols.js";
import systemCache from "./systemCache.js";
import SystemCacheMap from "./SystemCacheMap.js";

export default function SyncDependenciesTransform(Base) {
  return class SyncDependencies extends Base {
    constructor(...args) {
      super(...args);

      // Expose cache for debugging
      this.cache = systemCache;
    }

    get cachePath() {
      // @ts-ignore
      return this[cachePathSymbol];
    }

    cachePathForKey(key) {
      return key === "."
        ? this.cachePath
        : SystemCacheMap.joinPath(this.cachePath, key);
    }

    delete(key) {
      const deleted = super.delete(key);
      if (typeof key === "string") {
        systemCache.delete(this.cachePathForKey(key));
        if (deleted) {
          // Deleted an existing key, need to invalidate cached keys
          this.invalidateKeys();
        }
      }
      return deleted;
    }

    invalidateKeys() {
      const keysPath = this.cachePathForKey("_keys");
      systemCache.delete(keysPath);
    }

    *keys() {
      const keysPath = this.cachePathForKey("_keys");
      const keys = systemCache.getOrInsertComputed(keysPath, () =>
        // We can't cache an iterator; convert to array
        Array.from(super.keys()),
      );
      yield* keys;
    }

    onKeysChange(key) {
      super.onKeysChange?.(key);
      this.invalidateKeys();
    }

    onValueChange(key) {
      super.onValueChange?.(key);
      systemCache.delete(this.cachePathForKey(key));
    }

    set(key, value) {
      if (!this._self) {
        // Initializing in constructor
        super.set(key, value);
        return;
      }
      if (typeof key !== "string") {
        return super.set(key, value);
      }
      systemCache.delete(this.cachePathForKey(key));
      if (!this.has(key)) {
        // Adding a new key, need to invalidate cached keys
        this.invalidateKeys();
      }
      super.set(key, value);
    }
  };
}
