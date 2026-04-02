import { trailingSlash, Tree } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";

/**
 * When an Origami source file reads a file, record that dependency in the
 * dependency graph.
 */
export default function TrackDependencyMixin(Base) {
  return class TrackDependency extends Base {
    constructor(...args) {
      super(...args);
      this._dependencies = null;
      this._asyncStorage = null;
    }

    get asyncStorage() {
      this._asyncStorage ??= new AsyncLocalStorage();
      return this._asyncStorage;
    }

    get dependencies() {
      this._dependencies ??= new Map();
      return this._dependencies;
    }

    async get(key) {
      const value = await super.get(key);

      // Only interested in files
      if (value instanceof Uint8Array) {
        // To record the dependency, get the current async context
        // and dependencies from the root
        const root = await Tree.root(this);
        const asyncStorage = root?.asyncStorage;
        const dependencies = root?.dependencies;

        // See if we have a source path
        const context = asyncStorage?.getStore();
        const resourcePath = context?.resourcePath;
        if (resourcePath) {
          const normalizedKey = trailingSlash.remove(key);
          const filePath = path.join(this.path, normalizedKey);
          const relativePath = path.relative(root.path, filePath);

          // Record fact that the given resource depends on this file
          const dependentResources =
            dependencies.get(relativePath) ?? new Set();
          dependentResources.add(resourcePath);
          dependencies.set(relativePath, dependentResources);
        }
      }

      return value;
    }
  };
}
