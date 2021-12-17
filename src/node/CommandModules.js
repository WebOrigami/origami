import CommandModulesTransform from "./CommandModulesTransform.js";
import ExplorableFiles from "./ExplorableFiles.js";
import ImplicitModulesTransform from "./ImplicitModulesTransform.js";

export default class CommandModules extends CommandModulesTransform(
  ImplicitModulesTransform(ExplorableFiles)
) {}
