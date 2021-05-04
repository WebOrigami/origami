import * as fs from "fs/promises";
import path from "path";
import { ExplorableGraph } from "../../core/exports.js";

export default async function writeFiles(dirname, graph) {
  // Ensure target directory exists.
  await fs.mkdir(dirname, { recursive: true });

  // Write out files.
  for await (const key of graph) {
    const obj = await graph.get(key);
    const objPath = path.join(dirname, key);
    if (obj instanceof ExplorableGraph) {
      // Recurse
      await writeFiles(objPath, obj);
    } else {
      // Write out file
      await fs.writeFile(objPath, obj);
    }
  }
}
