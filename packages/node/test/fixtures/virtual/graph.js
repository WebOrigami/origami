import path from "path";
import { fileURLToPath } from "url";
import VirtualFiles from "../../../src/VirtualFiles.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default new VirtualFiles(dirname);
