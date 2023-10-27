import os from "node:os";
import OrigamiFiles from "../runtime/OrigamiFiles.js";
import Scope from "../runtime/Scope.js";
import builtins from "./@builtins.js";

/** @type {import("@graphorigami/types").AsyncTree} */
let tree = new OrigamiFiles(os.homedir());
tree = Scope.treeWithScope(tree, builtins);

export default tree;
