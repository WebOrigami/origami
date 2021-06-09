import path from "path";
import { pathToFileURL } from "url";
import ExplorableFiles from "./ExplorableFiles.js";

export default class JavaScriptModuleFiles extends ExplorableFiles {
  // We'd love to be able to defer to the superclass to return the file data and
  // then do a dynamic import from its data. Sadly, the `import()` statement can
  // only work with file paths, not data or streams. So we override asyncGet to
  // do an import instead of a readFile.
  async get(key) {
    if (!key.endsWith(".js") && !key.endsWith(".mjs")) {
      // Not a module; return as is.
      return await super.get(key);
    }
    const filePath = path.join(this.dirname, key);
    // On Windows, absolute paths must be valid file:// URLs.
    const fileUrl = pathToFileURL(filePath);
    const obj = await import(fileUrl.href);
    return obj;
  }
}
