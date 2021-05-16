import path from "path";
import { fileURLToPath } from "url";
import CommandModules from "../../src/node/CommandModules.js";
import JavaScriptModuleFiles from "../../src/node/JavaScriptModuleFiles.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesFolder = path.resolve(dirname, "commands");
const modules = new JavaScriptModuleFiles(modulesFolder);
const builtins = new CommandModules(modules);

export default builtins;
