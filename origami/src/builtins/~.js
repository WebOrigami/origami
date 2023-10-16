import { FileTree } from "@graphorigami/core";
import os from "node:os";
import FileTreeTransform from "../framework/FileTreeTransform.js";

export default new (FileTreeTransform(FileTree))(os.homedir());
