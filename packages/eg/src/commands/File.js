import { File as ExplorableFile } from "@explorablegraph/node";
import path from "path";
import process from "process";

export default async function File(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new ExplorableFile(resolvedPath);
}

File.usage = `File(path)                             An explorable graph with just one file`;
