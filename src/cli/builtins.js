import path from "node:path";
import { fileURLToPath } from "node:url";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");
const builtins = new (ImplicitModulesTransform(FilesGraph))(commandsFolder);

export default builtins;
