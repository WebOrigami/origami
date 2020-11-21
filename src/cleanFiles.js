import { promises as fs } from "fs";
import path from "path";
import Graph from "./Graph.js";

export default async function cleanFiles(options) {
  const { source, target } = options;

  for await (const key of source) {
    const obj = await source.get(key);
    const targetPath = path.join(target, key);
    if (obj instanceof Graph) {
      // Recurse
      await cleanFiles({
        source: obj,
        target: targetPath,
      });
    } else {
      // Delete file.
      try {
        await fs.unlink(targetPath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }
  }
}
