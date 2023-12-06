import { OrigamiFiles, Scope } from "@weborigami/language";
import os from "node:os";
import builtins from "./@builtins.js";

/** @type {import("@weborigami/types").AsyncTree} */
let tree = new OrigamiFiles(os.homedir());
tree = Scope.treeWithScope(tree, builtins);

export default tree;
