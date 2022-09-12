import path from "node:path";
import process from "node:process";
import FilesGraph from "../core/FilesGraph.js";

// TODO: Reconsider whether we can support a ...keys spread parameter.
export default async function files(dirname) {
  const resolved = dirname
    ? path.resolve(process.cwd(), dirname)
    : process.cwd();
  return new FilesGraph(resolved);
}

files.usage = `files [path]\tThe explorable files at the given path`;
files.documentation = "https://explorablegraph.org/cli/builtins.html#files";
