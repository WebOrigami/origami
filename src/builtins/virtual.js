import path from "path";
import ExplorableFiles from "../node/ExplorableFiles.js";
import graphVirtual from "./graphVirtual.js";

/**
 * Wrap the graph for the current directory as a virtual app.
 */
export default async function virtual(key) {
  const dirname = path.resolve(process.cwd());
  const files = new ExplorableFiles(dirname);
  const graph = await graphVirtual(files);
  return key === undefined ? graph : await graph.get(key);
}

virtual.usage = `virtual\tWrap the graph for the current directory with a virtual app`;
virtual.documentation = "https://explorablegraph.org/cli/builtins.html#virtual";
