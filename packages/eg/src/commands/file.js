import { promises as fs } from "fs";
import path from "path";
import process from "process";

export default async function file(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const data = await fs.readFile(resolvedPath);
  return String(data);
}

file.usage = `file(path)                             The contents of the file with the path`;
