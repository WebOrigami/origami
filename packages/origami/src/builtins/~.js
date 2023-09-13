import { FilesGraph } from "@graphorigami/core";
import os from "node:os";

export default new FilesGraph(os.homedir());
