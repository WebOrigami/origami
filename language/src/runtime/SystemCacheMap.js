import { SyncMap, trailingSlash } from "@weborigami/async-tree";
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
    // Construct a Map of all (path, entry) tuples to delete
    const toDelete = new Map();

    // Also construct a queue of entries to process for downstream dependencies
    const entryQueue = [];

    const entry = this.get(path);
    if (entry) {
      // We'll need to delete the existing entry for this path
      toDelete.set(path, entry);
      // Seed the queue with the existing entry
      entryQueue.push(entry);
    }

    // Add all entries with child paths that implicitly depend on this entry.
    // These child entries won't need to be detached from upstream entries --
    // they all ultimately depend on this entry which we're about to delete.
    for (const [otherPath, otherEntry] of this.entries()) {
      if (this.isChildPath(path, otherPath)) {
        toDelete.set(otherPath, otherEntry);
        entryQueue.push(otherEntry);
      }
    }

    // For each entry, add all downstream entries that explicitly depend on it.
    // Enqueue those so that their downstreams can be processed too.
    while (entryQueue.length > 0) {
      const currentEntry = entryQueue.shift();
      if (currentEntry.downstreams) {
        for (const downstreamPath of currentEntry.downstreams) {
          if (!toDelete.has(downstreamPath)) {
            const downstreamEntry = this.get(downstreamPath);
            if (downstreamEntry) {
              entryQueue.push(downstreamEntry);
              toDelete.set(downstreamPath, downstreamEntry);
            }
          }
        }
      }
    }

    // Delete everything
    for (const deletePath of toDelete.keys()) {
      super.delete(deletePath);
    }

    // Remove deleted entries as being downstream from still-existing entries
    for (const [deletePath, deleteEntry] of toDelete.entries()) {
      if (deleteEntry.upstreams) {
        for (const upstreamPath of deleteEntry.upstreams) {
          const upstreamEntry = this.get(upstreamPath);
          if (upstreamEntry?.downstreams) {
            upstreamEntry.downstreams.delete(deletePath);
            if (upstreamEntry.downstreams.size === 0) {
              // No more downstream dependencies, clean up entry
              delete upstreamEntry.downstreams;
            }
          }
        }
      }
    }

    return true;
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

    this.trackCurrentDependency(path, entry);

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

    this.trackCurrentDependency(path, entry);

    return entry.value;
  }

  // A path is considered a child path if the parent path (including a trailing
  // slash) is a prefix of the child path.
  isChildPath(parentPath, childPath) {
    const normalized = trailingSlash.add(parentPath);
    return childPath.startsWith(normalized);
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
  trackCurrentDependency(upstreamPath, upstreamEntry = null) {
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
      if (this.isChildPath(upstreamPath, downstream)) {
        // Downstream path is a child of the upstream path, no need to record
        // explicit dependency
        return;
      }

      let downstreamEntry = this.get(downstream);
      if (!downstreamEntry) {
        // The downstream entry has been deleted from the cache. It seems that
        // Node can resurrect an asyncStorage for a run that has already
        // finished. To cope, we reconstruct an entry.
        downstreamEntry = {};
        this.set(downstream, downstreamEntry);
      }

      // Add the downstream entry to the upstream entry's downstreams
      upstreamEntry.downstreams ??= new Set();
      upstreamEntry.downstreams.add(downstream);

      // Add the upstream entry to the downstream entry's upstreams
      downstreamEntry.upstreams ??= new Set();
      downstreamEntry.upstreams.add(upstreamPath);
    }
  }
}
