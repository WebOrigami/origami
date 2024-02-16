import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import CommandModulesTransform from "../common/CommandModulesTransform.js";

const commandsUrl = new URL("../builtins", import.meta.url);

/** @type {any} */
const builtins = new (CommandModulesTransform(ImportModulesMixin(FileTree)))(
  commandsUrl
);

builtins.usage = `@builtins\tThe Tree Origami built-in functions`;
builtins.documentation = "https://weborigami.org/language/@builtins.html";

export default builtins;
