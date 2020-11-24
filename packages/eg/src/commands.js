import { JavaScriptModuleFiles } from "@explorablegraph/node";
import path from "path";
import { fileURLToPath } from "url";

// Load a graph of our own commands.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(dirname, "commands");

const modules = new JavaScriptModuleFiles(commandsPath);
export default modules;
