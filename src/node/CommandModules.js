import CommandModulesTransform from "./CommandModulesTransform.js";
import FilesGraph from "./FilesGraph.js";
import ImplicitModulesTransform from "./ImplicitModulesTransform.js";

export default class CommandModules extends CommandModulesTransform(
  ImplicitModulesTransform(FilesGraph)
) {}
