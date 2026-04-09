import { trailingSlash, Tree } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";
import * as dependencies from "./pathCache.js";

/**
 * When an Origami source file reads a file, record that dependency in the
 * dependency graph.
 */
export default function TrackDependencyMixin(Base) {
  return class TrackDependency extends Base {
    constructor(...args) {
      super(...args);
      this._asyncStorage = null;
    }

    get asyncStorage() {
      this._asyncStorage ??= new AsyncLocalStorage();
      return this._asyncStorage;
    }

    async get(key) {
      const value = await super.get(key);

      // Only interested in files
      if (value instanceof Uint8Array) {
        // To record the dependency, get the current async context
        // and dependencies from the root
        const root = Tree.root(this);

        // See if we have an async context
        const context = root?.asyncStorage?.getStore();
        if (context) {
          // Record fact that the given resource depends on this file
          const { cache } = context;
          const normalizedKey = trailingSlash.remove(key);
          const filePath = path.join(this.path, normalizedKey);
          dependencies.add(filePath, cache, key, value);
        }
      }

      return value;
    }
  };
}
