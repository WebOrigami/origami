import { keysFromPath, Tree } from "@weborigami/async-tree";
import * as fs from "node:fs";
import path from "node:path";
import Watcher from "watcher";
import TreeEvent from "./TreeEvent.js";

export default function WatchFilesMixin(Base) {
  return class WatchFiles extends Base {
    addEventListener(type, listener) {
      super.addEventListener(type, listener);
    }

    onChange(filePath) {
      // Special case: ignore events in .git folder
      if (filePath.includes(`${path.sep}.git${path.sep}`)) {
        return;
      }

      this.dispatchEvent(new TreeEvent("change", { filePath }));
    }

    onKeysChange(key) {
      super.onKeysChange?.(key);
      // this.dispatchEvent(new TreeEvent("keyschange", { action, key }));
    }

    onValueChange(key) {
      super.onValueChange?.(key);
      // this.dispatchEvent(new TreeEvent("valuechange", { key }));
    }

    unwatch() {
      if (!this.watching) {
        return;
      }

      this.watcher?.close();
      this.watching = null;
    }

    // Turn on watching for the directory; resolves when the watcher is ready.
    watch() {
      if (this.watching) {
        return this.watching;
      }

      // Ensure the directory exists.
      fs.mkdirSync(this.dirname, { recursive: true });

      this.watcher = new Watcher(this.dirname, {
        ignoreInitial: true,
        recursive: true,
      });
      this.watching = new Promise((resolve) => {
        this.watcher?.on("ready", resolve);
      });
      this.watcher.on("all", async (event, filePath) => {
        this.onChange(filePath);

        const relativePath = path.relative(this.dirname, filePath);
        if (relativePath.startsWith(".git")) {
          return; // Ignore noisy events in .git folder
        }
        if (relativePath.startsWith("..")) {
          // Event outside the watched directory, shouldn't happen but ignore
          return;
        }

        const keys = keysFromPath(relativePath);
        const key = keys.pop();

        const target = await Tree.traverse(this, ...keys);
        if (target) {
          switch (event) {
            case "add":
            case "addDir":
              target.onKeysChange(key);
              break;

            case "change":
              target.onValueChange(key);
              break;

            case "unlink":
            case "unlinkDir":
              // Removing file/folder invalidates both its value and the keys
              target.onValueChange(key);
              target.onKeysChange(key);
              break;
          }
        }
      });

      return this.watching;
    }
  };
}
