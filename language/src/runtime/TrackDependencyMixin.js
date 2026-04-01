import { trailingSlash } from "@weborigami/async-tree";
import path from "node:path";
import dependencyGraph from "./dependencyGraph.js";
import executionContext from "./executionContext.js";

/**
 * When an Origami source file reads a file, record that dependency in the
 * dependency graph.
 */
export default function TrackDependencyMixin(Base) {
  return class TrackDependency extends Base {
    async get(key) {
      const value = await super.get(key);

      // Only interested in files
      if (value instanceof Uint8Array) {
        const normalizedKey = trailingSlash.remove(key);
        const filePath = path.join(this.path, normalizedKey);

        // See if we have a source path
        const context = executionContext.getStore();
        const sourcePath = context?.code?.location?.source?.url?.pathname;
        if (sourcePath) {
          // Record the dependency
          const dependencies = dependencyGraph.get(sourcePath) ?? new Set();
          dependencies.add(filePath);
          dependencyGraph.set(sourcePath, dependencies);
        }
      }

      return value;
    }
  };
}
