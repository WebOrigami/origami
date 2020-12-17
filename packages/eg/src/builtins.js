import { CommandModules, JavaScriptModuleFiles } from "@explorablegraph/node";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesFolder = path.resolve(dirname, "commands");
const modules = new JavaScriptModuleFiles(modulesFolder);
const builtins = new CommandModules(modules);

export default builtins;
