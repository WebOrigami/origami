import { promises as fs } from "fs";
import path from "path";
import Graph from "../exfn/wip/Graph.js";

export default class FileGraph extends Graph {
  dirname;

  constructor(dirname) {
    super();
    this.dirname = dirname;
  }

  async *[Symbol.asyncIterator]() {
    const entries = await fs.readdir(this.dirname, { withFileTypes: true });
    const names = entries.map((entry) => entry.name);
    yield* names;
  }

  get dirname() {
    return this.dirname;
  }

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
    const obj = stats.isDirectory()
      ? new FileGraph(filePath)
      : await fs.readFile(filePath);
    return obj;
  }
}
