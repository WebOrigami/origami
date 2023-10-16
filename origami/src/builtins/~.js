import { FilesTree } from "@graphorigami/core";
import os from "node:os";
import FileTreeTransform from "../framework/FileTreeTransform.js";

export default new (FileTreeTransform(FilesTree))(os.homedir());
