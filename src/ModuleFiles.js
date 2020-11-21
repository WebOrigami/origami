import { promises as fs } from "fs";
import path from "path";
import FileGraph from "./FileGraph.js";

export default class ModuleFiles extends FileGraph {
  // Override the get method to load a module with a dynamic import instead of
  // the usual fs.readFile.
  async get(key) {
    const filePath = path.join(this.dirname, key);

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
    }

    let result;
    if (stats.isDirectory()) {
      result = new ModuleFiles(filePath);
    } else {
      let module;
      try {
        module = await import(filePath);
      } catch (error) {
        console.error(
          `ModuleFiles: Could not load "${filePath}" as a JavaScript module.`
        );
      }
      result = module.default;
    }

    return result;
  }
}
