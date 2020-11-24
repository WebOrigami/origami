import path from "path";
import process from "process";
import { loadGraphFromArgument } from "../cliShared.js";
import makeFiles from "../makeFiles.js";

export default async function make(graphArg, target) {
  if (!graphArg || !target) {
    console.error(`usage:\n${make.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  makeFiles({
    source: graph,
    target: path.resolve(process.cwd(), target),
  });
}

make.usage = `eg make <graph> <directory>   Copy the graph to files in the given directory`;
