import path from "node:path";
import { fileURLToPath } from "node:url";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");

/** @type {any} */
const builtins = new (ImplicitModulesTransform(FilesGraph))(commandsFolder);

builtins.usage = `@builtins\tThe Graph Origami built-in functions`;
builtins.documentation = "https://graphorigami.org/cli/builtins.html#@builtins";

export default builtins;
