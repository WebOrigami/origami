import * as fs from "node:fs/promises";
import path from "node:path";
import Watcher from "watcher";
import GraphEvent from "./GraphEvent.js";

// Map of paths to graphs used by watcher
const pathGraphMap = new Map();

export default function WatchFilesMixin(Base) {
  return class WatchFiles extends Base {
    addEventListener(type, listener) {
      super.addEventListener(type, listener);
      if (type === "change") {
        this.watch();
      }
    }

    onChange(key) {
      // Reset cached values.
      this.subfoldersMap = new Map();
      this.dispatchEvent(new GraphEvent("change", { key }));
    }

    async unwatch() {
      if (!this.watching) {
        return;
      }

      this.watcher?.close();
      this.watching = false;
    }

    // Turn on watching for the directory.
    async watch() {
      if (this.watching) {
        return;
      }
      this.watching = true;

      // Ensure the directory exists.
      await fs.mkdir(this.dirname, { recursive: true });

      this.watcher = new Watcher(this.dirname, {
        ignoreInitial: true,
        persistent: false,
      });
      this.watcher.on("all", (event, filePath) => {
        const key = path.basename(filePath);
        this.onChange(key);
      });

      // Add to the list of FilesGraph instances watching this directory.
      const graphRefs = pathGraphMap.get(this.dirname) ?? [];
      graphRefs.push(new WeakRef(this));
      pathGraphMap.set(this.dirname, graphRefs);
    }
  };
}
