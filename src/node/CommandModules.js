import CommandModulesMixin from "./CommandModulesMixin.js";
import ExplorableFiles from "./ExplorableFiles.js";
import ModulesDefaultExportMixin from "./ModulesDefaultExportMixin.js";

export default class CommandModules extends CommandModulesMixin(
  ModulesDefaultExportMixin(ExplorableFiles)
) {}
