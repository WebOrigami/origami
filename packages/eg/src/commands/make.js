import { asyncOps } from "@explorablegraph/core";
import { Files } from "@explorablegraph/node";
import path from "path";
import process from "process";

export default async function make(graph) {
  const targetPath = path.join(process.cwd(), "build");
  const target = new Files(targetPath);
  await asyncOps.update(target, graph);
}
