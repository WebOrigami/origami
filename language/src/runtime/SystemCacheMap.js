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

  // REVIEW: This doesn't have the correct signature for getOrInsertComputed,
  // because it returns the entry `value` property, not the actual entry.
  getOrInsertComputed(path, computeFn) {
    let entry = this.get(path);
    if (!entry || !("value" in entry)) {
      // Cache miss, or entry has no value yet

      if (!entry) {
        // Create empty entry for this path
        entry = {};
        this.set(path, entry);
      }

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
    if (!entry || !("value" in entry)) {
      // Cache miss, or entry has no value yet

      if (syncStorage.getStore()) {
        // A function that was supposed to be sync called an async function
        throw new Error("Cannot track async dependencies in a sync context");
      }

      if (!entry) {
        // Create empty entry for this path
        entry = {};
        this.set(path, entry);
      }

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
    const cachePath = `_object${nextPathId}`;
    nextPathId++;
    return cachePath;
  }

  /**
   * Given a path for an upstream dependency, and optionally the entry for that
   * path if it has already been retrieved, track the dependency between the
   * upstream entry and the currently running downstream path.
   *
   * @param {string} upstreamPath
   * @param {any} [upstreamEntry]
   */
  trackDependency(upstreamPath, upstreamEntry = null) {
    if (!upstreamEntry) {
      upstreamEntry = this.get(upstreamPath);
      if (!upstreamEntry) {
        // Create empty entry for this path, so that dependencies can be tracked
        // for values that aren't cached.
        upstreamEntry = {};
        this.set(upstreamPath, upstreamEntry);
      }
    }

    // Is this call happening downstream of another cached value?
    const { downstream } =
      syncStorage.getStore() ?? asyncStorage.getStore() ?? {};
    if (downstream) {
      // Add the downstream entry to the upstream entry's downstreams
      upstreamEntry.downstreams ??= new Set();
      upstreamEntry.downstreams.add(downstream);

      // Add the upstream entry to the downstream entry's upstreams
      const downstreamEntry = this.get(downstream);
      downstreamEntry.upstreams ??= new Set();
      downstreamEntry.upstreams.add(upstreamPath);
    }
  }
}
