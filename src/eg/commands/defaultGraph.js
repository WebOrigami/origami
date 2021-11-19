import path from "path";
import InheritScopeMixin from "../../app/InheritScopeMixin.js";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import FileLoadersMixin from "../../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../../node/ImplicitModulesMixin.js";

class DefaultGraph extends FileLoadersMixin(
  InheritScopeMixin(ImplicitModulesMixin(ExplorableFiles))
) {}

export default function defaultGraph(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new DefaultGraph(resolvedPath);
}

defaultGraph.usage = `defaultGraph()\tThe default graph used by eg`;
