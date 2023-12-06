import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import CommandModulesTransform from "../common/CommandModulesTransform.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");

/** @type {any} */
const builtins = new (CommandModulesTransform(ImportModulesMixin(FileTree)))(
  commandsFolder
);

builtins.usage = `@builtins\tThe Tree Origami built-in functions`;
builtins.documentation = "https://graphorigami.org/language/@builtins.html";

export default builtins;
