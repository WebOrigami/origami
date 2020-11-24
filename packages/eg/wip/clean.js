import path from "path";
import process from "process";
import cleanFiles from "../cleanFiles.js";

export default async function clean(graph, target) {
  if (!graph || !target) {
    console.error(`usage:\n${clean.usage}`);
    return;
  }
  cleanFiles({
    source: graph,
    target: path.resolve(process.cwd(), target),
  });
}

clean.usage = `eg clean <graph> <directory>  Clean the files in the given directory`;
