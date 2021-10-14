import CommandModulesMixin from "./CommandModulesMixin.js";
import ExplorableFiles from "./ExplorableFiles.js";
import ImplicitModulesMixin from "./ImplicitModulesMixin.js";

export default class CommandModules extends CommandModulesMixin(
  ImplicitModulesMixin(ExplorableFiles)
) {}
