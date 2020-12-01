import { AsyncExplorable, asyncGet, asyncKeys } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default class ExplorableFiles extends AsyncExplorable {
  constructor(dirname) {
    super();
    this.dirname = dirname;
  }

  async *[asyncKeys]() {
    const entries = await fs.readdir(this.dirname, { withFileTypes: true });
    const names = entries.map((entry) => entry.name);
    yield* names;
  }

  async [asyncGet](...keys) {
    // We can traverse the keys by joining them into a path.
    const objPath = path.join(this.dirname, ...keys);
    let stats;
    try {
      stats = await fs.stat(objPath);
    } catch (error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
    }
    const value = stats.isDirectory()
      ? new this.constructor(objPath)
      : await fs.readFile(objPath);
    return value;
  }
}
