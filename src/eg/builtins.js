import path from "path";
import { fileURLToPath } from "url";
import CommandModules from "../../src/node/CommandModules.js";
import ExplorableFiles from "../node/ExplorableFiles.js";
import ModulesDefaultExportMixin from "../node/ModulesDefaultExportMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesFolder = path.resolve(dirname, "commands");
const modules = new (ModulesDefaultExportMixin(ExplorableFiles))(modulesFolder);
const builtins = new CommandModules(modules);

export default builtins;
