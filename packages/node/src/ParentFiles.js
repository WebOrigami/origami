import { AsyncExplorable, asyncGet } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default class ParentFiles extends AsyncExplorable {
  constructor(dirname) {
    super();
    this.dirname = dirname;
  }

  async [asyncGet](key) {
    return await searchUp(this.dirname, key);
  }
}

// Walk up the folder hiearchy, returning the path for the closest file with the
// given name.
async function searchUp(dirname, filename) {
  let current = dirname;
  while (true) {
    const filePath = path.join(current, filename);
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
