import path from "node:path";
import debugStorage from "./debugStorage.js";

export default function ActiveFileMixin(Base) {
  return class ActiveFile extends Base {
    constructor(...args) {
      super(...args);
      this._activeFilePath = null;
    }

    get activeFilePath() {
      return this._activeFilePath;
    }
    set activeFilePath(filePath) {
      this._activeFilePath = filePath;
    }

    async get(key) {
      const value = await super.get(key);

      if (value === undefined) {
        return undefined;
      }

      if (value instanceof ActiveFile) {
        value.activeFilePath = this._activeFilePath;
      } else if (value instanceof Uint8Array) {
        const filePath = this.path ? path.join(this.path, key) : key;
        if (filePath === this._activeFilePath) {
          // The active file was accessed
          const storage = debugStorage.getStore();
          storage.activeFileRead = true;
        }
      }

      return value;
    }
  };
}
