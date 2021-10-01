import path from "path";
import ExplorableFiles from "../../node/ExplorableFiles.js";

export default async function files(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new ExplorableFiles(resolvedPath);
}

files.usage = `files(path)\tThe explorable files at path`;
