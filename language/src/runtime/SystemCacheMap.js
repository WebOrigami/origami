import { SyncMap } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";

// Async storage for tracking dependencies encountered during function evaluation
const asyncStorage = new AsyncLocalStorage();

// Sync analogue to AsyncLocalStorage for tracking dependencies in sync functions
const syncStorage = {
  getStore() {
    return this.stack.at(-1);
  },

  run(context, fn) {
    this.stack.push(context);
    const value = fn();
    this.stack.pop();
    return value;
  },

  /** @type {any[]} */
  stack: [],
};

// For choosing a quasi-unique path for maps without a `cachePath` property
let nextPathId = 0;

export default class SystemCacheMap extends SyncMap {
  delete(path) {
    const entry = this.get(path);
    if (entry) {
      // Invalidate downstream cached values
      if (entry.downstreams) {
        for (const downstreamPath of entry.downstreams) {
          this.delete(downstreamPath);
        }
      }

      // Remove this entry from upstreams of any entries it depends on
      if (entry.upstreams) {
        for (const upstreamPath of entry.upstreams) {
          const upstreamEntry = this.get(upstreamPath);
          upstreamEntry?.downstreams.delete(path);
        }
      }
    }
    return super.delete(path);
  }

  getOrInsertComputed(path, computeFn) {
    let entry = this.get(path);
    if (!entry) {
      // Cache miss

      // Create empty entry for this path
      entry = {};
      this.set(path, entry);

      // Create new sync context to track entries downstream of this value
      const context = { downstream: path };

      // Get value in sync context
      entry.value = syncStorage.run(context, computeFn);
    }

    this.trackDependency(path, entry);

    return entry.value;
  }

  async getOrInsertComputedAsync(path, computeFn) {
    let entry = this.get(path);
    if (!entry) {
      // Cache miss

      if (syncStorage.getStore()) {
        // A function that was supposed to be sync called an async function
        throw new Error("Cannot track async dependencies in a sync context");
      }

      // Create empty entry for this path
      entry = {};
      this.set(path, entry);

      // Create new async context to track entries downstream of this value
      const context = { downstream: path };

      // Get value in async context, don't await the result yet. Add promise to
      // cache so concurrent requests get the same promise.
      entry.value = asyncStorage.run(context, async () => {
        const value = await computeFn();
        // Add resolved value to cache
        entry.value = value;
        return value;
      });
    }

    this.trackDependency(path, entry);

    return entry.value;
  }

  nextDefaultCachePath() {
    const cachePath = `_map${nextPathId}`;
    nextPathId++;
    return cachePath;
  }

  trackDependency(path, entry) {
    // Is this call happening downstream of another cached value?
    const { downstream } =
      syncStorage.getStore() ?? asyncStorage.getStore() ?? {};
    if (downstream) {
      // Record that the downstream value depends on this cached value
      entry.downstreams ??= new Set();
      entry.downstreams.add(downstream);

      // Record that this cached value is upstream of the downstream value
      const downstreamEntry = this.get(downstream);
      downstreamEntry.upstreams ??= new Set();
      downstreamEntry.upstreams.add(path);
    }
  }
}
