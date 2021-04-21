import { ExplorableGraph } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default async function unlinkFiles(dirname, graph) {
  for await (const key of graph) {
    const obj = await graph.get(key);
    const objPath = path.join(dirname, key);
    if (obj instanceof ExplorableGraph) {
      // Recurse
      await unlinkFiles(objPath, obj);
    } else {
      // Delete file.
      try {
        await fs.unlink(objPath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }
  }
}
