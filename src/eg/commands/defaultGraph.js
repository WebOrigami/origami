import path from "path";
import CommonFileTypesMixin from "../../node/CommonFileTypesMixin.js";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import JavaScriptModuleFiles from "../../node/ModulesDefaultExportMixin.js";

class DefaultGraph extends CommonFileTypesMixin(
  JavaScriptModuleFiles(ExplorableFiles)
) {}

export default async function defaultGraph(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new DefaultGraph(resolvedPath);
}

defaultGraph.usage = `defaultGraph()\tThe default graph used by eg`;
