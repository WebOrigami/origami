import os from "node:os";
import { treeWithScope } from "../common/utilities.js";
import OrigamiFiles from "../runtime/OrigamiFiles.js";
import builtins from "./@builtins.js";

/** @type {import("@graphorigami/types").AsyncTree} */
let tree = new OrigamiFiles(os.homedir());
tree = treeWithScope(tree, builtins);

export default tree;
