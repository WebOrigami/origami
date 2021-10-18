import path from "path";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import FileLoadersMixin from "../../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../../node/ImplicitModulesMixin.js";

class DefaultGraph extends ImplicitModulesMixin(
  FileLoadersMixin(ExplorableFiles)
) {}

export default async function defaultGraph(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new DefaultGraph(resolvedPath);
}

defaultGraph.usage = `defaultGraph()\tThe default graph used by eg`;
