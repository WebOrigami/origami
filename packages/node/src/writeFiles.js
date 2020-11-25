import { AsyncExplorable, asyncGet } from "@explorablegraph/exfn";
import { promises as fs } from "fs";
import path from "path";

export default async function writeFiles(dirname, exfn) {
  // Ensure target directory exists.
  await fs.mkdir(dirname, { recursive: true });

  // Write out files.
  for await (const key of exfn) {
    const obj = await exfn[asyncGet](key);
    const objPath = path.join(dirname, key);
    if (obj instanceof AsyncExplorable) {
      // Recurse
      await writeFiles(objPath, obj);
    } else {
      // Write out file
      await fs.writeFile(objPath, obj);
    }
  }
}
