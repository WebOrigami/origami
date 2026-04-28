import { SyncMap } from "@weborigami/async-tree";
import path from "node:path";
import systemCache from "./systemCache.js";

/**
 * Return a sync map of all values in scope for the given sync source map.
 *
 * @param {SyncMap} source
 */
export default class ScopeMap extends SyncMap {
  constructor(source) {
    super();
    this.source = source;
    this.trailingSlashKeys = source.trailingSlashKeys;
  }

  get(key) {
    let value;

    // Starting with this map, search up its parent hierarchy
    let current = this.source;
    while (current) {
      // If the keys of this folder change, the scope request for this key could
      // return a different value, so a change in keys needs to invalidate the
      // value. Whether or not the get() request below succeeds, track the keys
      // of this folder as an upstream dependency of the value being requested.
      if (current.cachePath) {
        const folderKeysPath = path.join(current.cachePath, "_keys");
        systemCache.trackCurrentDependency(folderKeysPath);
      }

      value = current.get(key);
      if (value !== undefined) {
        break;
      }
      current = current.parent;
    }

    return value;
  }

  // Collect all keys for this tree and all parents
  keys() {
    const scopeKeys = new Set();
    let current = this.source;
    while (current) {
      for (const key of current.keys()) {
        scopeKeys.add(key);
      }
      current = current.parent;
    }
    return scopeKeys[Symbol.iterator]();
  }

  // Collect all keys for this tree and all parents.
  //
  // This method exists for debugging purposes, as it's helpful to be able to
  // quickly flatten and view the entire scope chain.
  get trees() {
    const result = [];

    /** @type {SyncMap|null} */
    let current = this.source;
    while (current) {
      result.push(current);
      current = "parent" in current ? current.parent : null;
    }

    return result;
  }
}
