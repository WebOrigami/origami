import * as fs from "fs/promises";
import path from "path";

export default async function file(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const data = await fs.readFile(resolvedPath);
  return String(data);
}

file.usage = `file(path)\tThe contents of the file with the path`;
