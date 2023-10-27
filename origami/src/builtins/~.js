import { OrigamiFiles, Scope } from "@graphorigami/language";
import os from "node:os";
import builtins from "./@builtins.js";

/** @type {import("@graphorigami/types").AsyncTree} */
let tree = new OrigamiFiles(os.homedir());
tree = Scope.treeWithScope(tree, builtins);

export default tree;
