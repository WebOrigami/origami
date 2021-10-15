import path from "path";
import process from "process";
import ExplorableFiles from "../../node/ExplorableFiles.js";

export default async function files(...keys) {
  const dirname = path.resolve(process.cwd(), ...keys);
  return new ExplorableFiles(dirname);
}

files.usage = `files([path])\tThe explorable files at the given path`;
