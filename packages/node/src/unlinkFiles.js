import { AsyncExplorable, asyncGet } from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default async function unlinkFiles(dirname, exfn) {
  for await (const key of exfn) {
    const obj = await exfn[asyncGet](key);
    const objPath = path.join(dirname, key);
    if (obj instanceof AsyncExplorable) {
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
