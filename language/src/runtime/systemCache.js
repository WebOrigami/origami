import { SyncMap } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";

// Async storage for tracking dependencies encountered during function evaluation
const storage = new AsyncLocalStorage();

export class SystemCacheMap extends SyncMap {
  delete(path) {
    const entry = this.get(path);
    if (entry) {
      // Invalidate downstream cached values
      if (entry.downstreams) {
        for (const downstreamPath of entry.downstreams) {
          systemCache.delete(downstreamPath);
        }
      }

      // Remove this entry from upstreams of any entries it depends on
      if (entry.upstreams) {
        for (const upstreamPath of entry.upstreams) {
          const upstreamEntry = systemCache.get(upstreamPath);
          upstreamEntry?.downstreams.delete(path);
        }
      }
    }
    return super.delete(path);
  }

  async getAndTrackDependencies(path, computeFn) {
    let entry = systemCache.get(path);
    if (!entry) {
      // Cache miss

      // Create empty entry for this path
      entry = {};
      systemCache.set(path, entry);

      // Create new async context to track entries downstream of this value
      const context = { downstream: path };

      // Get value in async context, don't await the result yet. Add promise to
      // cache so concurrent requests get the same promise.
      entry.value = storage.run(context, async () => {
        const value = await computeFn();
        // Add resolved value to cache
        entry.value = value;
        return value;
      });
    }

    // Is this call happening downstream of another cached value?
    const { downstream } = storage.getStore() ?? {};
    if (downstream) {
      // Record that the downstream value depends on this cached value
      entry.downstreams ??= new Set();
      entry.downstreams.add(downstream);

      // Record that this cached value is upstream of the downstream value
      const downstreamEntry = systemCache.get(downstream);
      downstreamEntry.upstreams ??= new Set();
      downstreamEntry.upstreams.add(path);
    }

    return entry.value;
  }
}

const systemCache = new SystemCacheMap();

export default systemCache;
