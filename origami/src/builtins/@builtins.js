import { FilesTree } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import CommandModulesTransform from "../common/CommandModulesTransform.js";
import ImportModulesMixin from "../common/ImportModulesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");

/** @type {any} */
const builtins = new (CommandModulesTransform(ImportModulesMixin(FilesTree)))(
  commandsFolder
);

builtins.usage = `@builtins\tThe Tree Origami built-in functions`;
builtins.documentation = "https://graphorigami.org/language/@builtins.html";

export default builtins;
