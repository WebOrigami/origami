import * as fs from "node:fs";
import path from "node:path";
import Watcher from "watcher";
import TreeEvent from "./TreeEvent.js";

export default function WatchFilesMixin(Base) {
  return class WatchFiles extends Base {
    addEventListener(type, listener) {
      super.addEventListener(type, listener);
      if (type === "change") {
        this.watch();
      }
    }

    onChange(filePath) {
      // Special case: ignore events in .git folder
      if (filePath.includes(`${path.sep}.git${path.sep}`)) {
        return;
      }

      this.dispatchEvent(new TreeEvent("change", { filePath }));
    }

    onValueChange(key) {}

    unwatch() {
      if (!this.watching) {
        return;
      }

      this.watcher?.close();
      this.watching = false;
    }

    // Turn on watching for the directory.
    watch() {
      if (this.watching) {
        return;
      }
      this.watching = true;

      // Ensure the directory exists.
      fs.mkdirSync(this.dirname, { recursive: true });

      this.watcher = new Watcher(this.dirname, {
        ignoreInitial: true,
        persistent: false,
        recursive: true,
      });
      this.watcher.on("all", (event, filePath) => {
        this.onChange(filePath);

        const relativePath = path.relative(this.dirname, filePath);
        this.onValueChange(relativePath);
      });
    }
  };
}
