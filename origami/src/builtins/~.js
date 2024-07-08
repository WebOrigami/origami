import { OrigamiFiles } from "@weborigami/language";
import os from "node:os";
import builtins from "./@builtins.js";

/** @type {import("@weborigami/types").AsyncTree} */
const tree = new OrigamiFiles(os.homedir());
tree.parent = builtins;

export default tree;
