/**
 * Graph of files a given Origami source file depends on, mapping a file path
 * relative to the project root to a set of (map, key) pairs for values that
 * depend on that file.
 *
 *   source path -> [{ cache, key }]
 *
 * The idea is that when a file changes, the dependency map can be used to look
 * up all the (map, key) pairs that for cached values that depend on that file.
 * The corresponding map entries can then be evicted.
 *
 * @type {Map<string, [{ cache: Map, key: string }]>}
 */
const dependencies = new Map();

export function add(filePath, cache, key, value) {
  cache.set(key, value);
  let dependents = dependencies.get(filePath);
  if (!dependents) {
    dependents = [];
    dependencies.set(filePath, dependents);
  }
  dependents.push({ cache, key });
}

export function evict(filePath) {
  const dependents = dependencies.get(filePath);
  if (dependents) {
    for (const { cache, key } of dependents) {
      cache.delete(key);
    }
    dependencies.delete(filePath);
  }
}

export function get(filePath) {
  return dependencies.get(filePath) || [];
}
