import path from "path";
import process from "process";
import ExplorableFiles from "../../node/ExplorableFiles.js";

// TODO: Reconsider whether we can support a ...keys spread parameter.
export default async function files(dirname) {
  const resolved = dirname
    ? path.resolve(process.cwd(), dirname)
    : process.cwd();
  return new ExplorableFiles(resolved);
}

files.usage = `files([path])\tThe explorable files at the given path`;
