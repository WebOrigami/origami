import * as fs from "fs/promises";

export default async function file(filePath) {
  const data = await fs.readFile(filePath);
  return String(data);
}

file.usage = `file(path)\tThe contents of the file with the path`;
