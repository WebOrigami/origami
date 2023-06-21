import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";
import FileTreeTransform from "./FileTreeTransform.js";

export default class OrigamiFiles extends FileTreeTransform(
  ImplicitModulesTransform(FilesGraph)
) {}
