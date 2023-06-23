import path from "node:path";
import { fileURLToPath } from "node:url";
import FilesGraph from "../core/FilesGraph.js";
import ImplicitModulesTransform from "../framework/ImplicitModulesTransform.js";
import ImportModulesMixin from "../framework/ImportModulesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");

/** @type {any} */
const builtins = new (ImplicitModulesTransform(ImportModulesMixin(FilesGraph)))(
  commandsFolder
);

builtins.usage = `@builtins\tThe Graph Origami built-in functions`;
builtins.documentation = "https://graphorigami.org/language/@builtins.html";

export default builtins;
