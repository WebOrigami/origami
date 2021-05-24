import * as fs from "fs/promises";
import path from "path";

export default class ParentFiles {
  constructor(dirname) {
    this.dirname = dirname;
  }

  // Rather than returning all parent files, this currently returns nothing.
  async *[Symbol.asyncIterator]() {}

  // Walk up the folder hiearchy, returning the path for the closest file with
  // the given name.
  async get(key) {
    let current = this.dirname;
    while (true) {
      const filePath = path.join(current, key);
      try {
        await fs.stat(filePath);
        return filePath; // Found
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
      // Go up a level.
      const parent = path.resolve(current, "..");
      if (parent === current) {
        // Hit root.
        return undefined;
      }
      current = parent;
    }
  }
}
