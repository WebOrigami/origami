import path from "path";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import ExplorableFiles from "../node/ExplorableFiles.js";
import FileLoadersTransform from "../node/FileLoadersTransform.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";

class DefaultGraph extends FileLoadersTransform(
  InheritScopeTransform(ImplicitModulesTransform(ExplorableFiles))
) {}

export default function defaultGraph(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new DefaultGraph(resolvedPath);
}

defaultGraph.usage = `defaultGraph\tThe default graph used by eg`;
defaultGraph.documentation =
  "https://explorablegraph.org/pika/builtins.html#defaultGraph";
