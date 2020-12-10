import { Files as ExplorableFiles } from "@explorablegraph/node";
import path from "path";
import process from "process";

export default async function Files(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new ExplorableFiles(resolvedPath);
}

Files.usage = `Files(path)\tThe explorable files at path`;
