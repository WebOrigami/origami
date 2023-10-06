import { FilesGraph } from "@graphorigami/core";
import os from "node:os";
import FileTreeTransform from "../framework/FileTreeTransform.js";

export default new (FileTreeTransform(FilesGraph))(os.homedir());
