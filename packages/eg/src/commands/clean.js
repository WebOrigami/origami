import { unlinkFiles } from "@explorablegraph/node";
import path from "path";
import process from "process";
import { loadGraphFromArgument } from "../shared.js";

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
