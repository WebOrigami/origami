import { SyncMap } from "@weborigami/async-tree";

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

  // Starting with this map, search up the parent hierarchy.
  get(key) {
    let current = this.source;
    let value;
    while (current) {
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
