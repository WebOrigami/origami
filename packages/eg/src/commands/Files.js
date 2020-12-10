import { Files } from "@explorablegraph/node";
import path from "path";
import process from "process";

export default async function files(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new Files(resolvedPath);
}

files.usage = `Files(path)\tThe explorable files at path`;
