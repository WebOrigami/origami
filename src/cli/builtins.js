import path from "path";
import { fileURLToPath } from "url";
import CommandModules from "../node/CommandModules.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");
const builtins = new CommandModules(commandsFolder);

export default builtins;
