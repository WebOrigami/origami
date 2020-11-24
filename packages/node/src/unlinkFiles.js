import { promises as fs } from "fs";
import path from "path";

export default async function unlinkFiles(dirname, exfn) {
  for await (const key of exfn) {
    const obj = await exfn[exfn.constructor.get](key);
    const objPath = path.join(dirname, key);
    if (exfn.constructor.isExplorable(obj)) {
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
