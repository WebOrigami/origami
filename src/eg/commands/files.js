import path from "path";
import process from "process";
import ExplorableFiles from "../../node/ExplorableFiles.js";

// TODO: Reconsider whether we can support a ...keys spread parameter.
export default async function files(key) {
  const dirname = path.resolve(process.cwd(), key);
  return new ExplorableFiles(dirname);
}

files.usage = `files([path])\tThe explorable files at the given path`;
