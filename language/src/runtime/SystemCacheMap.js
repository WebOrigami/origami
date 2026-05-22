import { SyncMap, trailingSlash } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";
import { volatileSymbol } from "./symbols.js";

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
    // Find all entries that depend on this path directly or indirectly
    const toDelete = this.dependentEntries(path);

    // Delete those dependent entries
    for (const deletePath of toDelete.keys()) {
      super.delete(deletePath);
    }

    // Remove deleted entries as being downstream from still-existing entries
    for (const [deletePath, deleteEntry] of toDelete.entries()) {
      for (const upstreamPath of deleteEntry.upstreams ?? []) {
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

    return true;
  }

  // Return all entries that directly or indirectly depend on the given path
  dependentEntries(path) {
    const result = new Map();

    const entry = this.get(path);
    if (entry) {
      // Path itself has an entry
      result.set(path, entry);
    }

    // Add all entries with child paths that implicitly depend on this entry
    for (const [otherPath, otherEntry] of this.entries()) {
      if (this.isChildPath(path, otherPath)) {
        result.set(otherPath, otherEntry);
      }
    }

    // For each entry, add all entries downstream of it
    for (const entry of result.values()) {
      for (const downstreamPath of entry.downstreams ?? []) {
        if (!result.has(downstreamPath)) {
          for (const [key, value] of this.dependentEntries(downstreamPath)) {
            if (!result.has(key)) {
              result.set(key, value);
            }
          }
        }
      }
    }

    return result;
  }

  // REVIEW: This doesn't have the correct signature for getOrInsertComputed,
  // because it returns the entry `value` property, not the actual entry.
  getOrInsertComputed(path, computeFn) {
    let entry = this.get(path);

    if (entry && "value" in entry) {
      // Cache hit, value already computed
      this.trackCurrentDependency(path, entry);
      return entry.value;
    }

    // Cache miss, or entry has no value yet
    let value;

    if (!entry) {
      // Create empty entry for this path
      entry = {};
      this.set(path, entry);
    }

    // Create new sync context to track entries downstream of this value
    const context = { downstream: path };

    // Get value in sync context
    value = syncStorage.run(context, computeFn);
    if (!value?.[volatileSymbol]) {
      // Add resolved value to cache
      entry.value = value;
    }

    this.trackCurrentDependency(path, entry);

    return value;
  }

  async getOrInsertComputedAsync(path, computeFn) {
    let entry = this.get(path);

    if (entry && "value" in entry) {
      // Cache hit, value already computed
      this.trackCurrentDependency(path, entry);
      return entry.value;
    }

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
      if (value?.[volatileSymbol]) {
        // Value is marked as volatile, don't cache it
        delete entry.value;
      } else {
        // Add resolved value to cache
        entry.value = value;
      }
      return value;
    });

    this.trackCurrentDependency(path, entry);

    return entry.value;
  }

  /**
   * Like standard path.join(), but without special handling for absolute or
   * relative paths: adding "/", ".", or ".." adds those strings to the path.
   * This also avoids the behavior in path.join() where consecutive separators
   * are collapsed. We want the cache path `a//b` to be distinct from `a/b`.
   *
   * @param {string[]} segments
   */
  static joinPath(...segments) {
    let result = segments.shift() ?? "";
    while (segments.length > 0) {
      if (!result.endsWith("/")) {
        result += "/";
      }
      let segment = segments.shift() ?? "";
      result += segment;
    }
    return result;
  }

  // A path is considered a child path if the parent path (including a trailing
  // slash) is a prefix of the child path.
  isChildPath(parentPath, childPath) {
    const normalized = trailingSlash.add(parentPath);
    return childPath.startsWith(normalized);
  }

  static nextDefaultCachePath() {
    const cachePath = `_object${nextPathId}`;
    nextPathId++;
    return cachePath;
  }

  runInContext(cachePath, fn) {
    const context = { downstream: cachePath };
    return syncStorage.run(context, fn);
  }

  runInContextAsync(cachePath, fn) {
    const context = { downstream: cachePath };
    return asyncStorage.run(context, fn);
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
