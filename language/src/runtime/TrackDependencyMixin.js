import { trailingSlash } from "@weborigami/async-tree";
import path from "node:path";
import * as dependencyGraph from "./dependencyGraph.js";

export default function TrackDependencyMixin(Base) {
  return class TrackDependency extends Base {
    async get(key) {
      const value = await super.get(key);

      if (value instanceof Uint8Array) {
        const normalizedKey = trailingSlash.remove(key);
        const filePath = path.join(this.path, normalizedKey);
        const store = dependencyGraph.storage.getStore();
        const sourcePath = store?.sourcePath;
        if (sourcePath) {
          const dependencies =
            dependencyGraph.graph.get(sourcePath) ?? new Set();
          dependencies.add(filePath);
          dependencyGraph.graph.set(sourcePath, dependencies);
        }
      }

      return value;
    }
  };
}
