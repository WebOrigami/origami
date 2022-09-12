import path from "node:path";
import { fileURLToPath } from "node:url";
import FilesGraph from "../core/FilesGraph.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");
const builtins = new (ImplicitModulesTransform(FilesGraph))(commandsFolder);

export default builtins;
