import { asyncGet } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";
import Files from "./Files.js";

export default class JavaScriptModuleFiles extends Files {
  // We'd love to be able to defer to the superclass to return the file data and
  // then do a dynamic import from its data. Sadly, the `import()` statement can
  // only work with file paths, not data or streams. So we override asyncGet to
  // do an import instead of a readFile.
  async [asyncGet](key) {
    if (!key.endsWith(".js") && !key.endsWith(".mjs")) {
      // Not a module; return as is.
      return await super[asyncGet](key);
    }

    const filePath = path.join(this.dirname, key);
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
      throw error;
    }
    const obj = stats.isDirectory()
      ? Reflect.construct(this.constructor, [filePath])
      : await import(filePath);
    return obj;
  }
}
