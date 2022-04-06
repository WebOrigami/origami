import path from "path";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import ExplorableFiles from "../node/ExplorableFiles.js";
import FileLoadersTransform from "../node/FileLoadersTransform.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";
import config from "./config.js";

class DefaultGraph extends FileLoadersTransform(
  InheritScopeTransform(ImplicitModulesTransform(ExplorableFiles))
) {}

export default async function defaultGraph(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const graph = new DefaultGraph(resolvedPath);
  graph.parent = await config();
  return graph;
}

defaultGraph.usage = `defaultGraph\tThe default graph used by Origami`;
defaultGraph.documentation =
  "https://explorablegraph.org/cli/builtins.html#defaultGraph";
