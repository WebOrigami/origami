import { promises as fs } from "fs";
import path from "path";
import Graph from "./Graph.js";

// TODO: Define as a visitor pattern in Graph.
export default async function makeFiles(options) {
  const { source, target } = options;

  await fs.mkdir(target, { recursive: true });

  for await (const key of source) {
    const obj = await source.get(key);
    const targetPath = path.join(target, key);
    if (obj instanceof Graph) {
      // Recurse
      await makeFiles({
        source: obj,
        target: targetPath,
      });
    } else {
      // Write out file
      await fs.writeFile(targetPath, obj);
    }
  }
}
