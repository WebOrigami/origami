import { AsyncLocalStorage } from "node:async_hooks";

/**
 * General-purpose cache for Origami objects with dependency tracking, used for:
 * files, site resources, and scope references in Origami files
 *
 * Objects in the cache are keyed by a path: typically a file path or URL that
 * can be extended with additional slash-separated segments.
 *
 * If a downstream value B depends on an upstream value A, the graph records
 * that dependency so that if A changes, B can be invalidated from the cache.
 *
 *   upstream path -> [{ downstream: Set(downstream paths), value }]
 *
 * This allows for efficiently evicting all a value and all its downstream
 * dependent cached values.
 *
 * Example project:
 *
 *     site.ori loads a.ori and b.ori
 *     a.ori loads c.ori
 *     b.ori loads c.ori
 *     c.ori doesn't load anything
 *
 * Resulting cache:
 *
 *      site.ori -> { value: ... }
 *      a.ori -> { downstreams: Set(site.ori), value: ... }
 *      b.ori -> { downstreams: Set(site.ori), value: ... }
 *      c.ori -> { downstreams: Set(a.ori, b.ori), value: ... }
 *
 * @type {Map<string, { downstreams?: Set<string>, value: any }>}
 */
const cache = new Map();

// Async storage for tracking dependencies encountered during function evaluation
const storage = new AsyncLocalStorage();

export function clear() {
  cache.clear();
}

// For testing
export function entries() {
  const entries = [...cache.entries()];
  return entries.map(([key, { downstreams, value }]) => [
    key,
    Object.assign(
      {
        value,
      },
      downstreams ? { downstreams: [...downstreams] } : {},
    ),
  ]);
}

export function evict(upstream) {
  const entry = cache.get(upstream);
  if (entry) {
    if (entry.downstreams) {
      for (const downstream of entry.downstreams) {
        evict(downstream);
      }
    }
    cache.delete(upstream);
  }
}

/**
 * Get a value for the given path from the cache, or insert it if it does not
 * exist.
 *
 * If the compute function must be called to produce a value, during that
 * evaluation record any other cache references as upstream dependencies of this
 * downstream value.
 *
 * @param {string} path
 * @param {() => any} compute
 */
export async function getOrInsertComputed(path, compute) {
  let entry = cache.get(path);
  if (!entry) {
    // Cache miss

    // Create new async context to track entries downstream of this value
    const context = { downstream: path };

    // Run compute in async context but don't await the result yet
    const value = await storage.run(context, compute);

    // Add to cache now so concurrent requests get the same promise
    entry = { value };
    cache.set(path, entry);
  }

  // Is this call happening downstream of another cached value?
  const downstream = storage.getStore()?.downstream;
  if (downstream) {
    // Record that the downstream value depends on this cached value
    entry.downstreams ??= new Set();
    entry.downstreams.add(downstream);
  }

  return entry.value;
}
