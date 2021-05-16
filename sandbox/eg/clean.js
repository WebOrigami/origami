import path from "path";
import process from "process";
import { unlinkFiles } from "../../node/exports.js";
import { loadGraphFromArgument } from "../src/shared.js";

export default async function clean(graphArg, target) {
  if (!graphArg || !target) {
    console.error(`usage:\n${clean.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const dirname = path.resolve(process.cwd(), target);
  await unlinkFiles(dirname, graph);
}

clean.usage = `eg clean <graph> <directory>  Clean the files in the given directory`;
