import { writeFiles } from "@explorablegraph/node";
import path from "path";
import process from "process";
import { loadGraphFromArgument } from "../shared.js";

export default async function make(graphArg, target) {
  if (!graphArg || !target) {
    console.error(`usage:\n${make.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const dirname = path.resolve(process.cwd(), target);
  await writeFiles(dirname, graph);
}

make.usage = `eg make <graph> <directory>   Copy the graph to files in the given directory`;
