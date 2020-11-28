import { asyncGet } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";
import ExplorableFiles from "./ExplorableFiles.js";

export default class JavaScriptModuleFiles extends ExplorableFiles {
  // We'd love to be able to defer to the superclass to return the file data
  // to use an import that. Sadly, the `import()` statement can only
  //
  async [asyncGet](key) {
    const filePath = path.join(this.dirname, key);
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
    }
    const obj = stats.isDirectory()
      ? new this.constructor(filePath)
      : await import(filePath);
    return obj;
  }
}
