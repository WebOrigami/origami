import path from "path";
import { fileURLToPath } from "url";
import ArrowModules from "../../../src/ArrowModules.js";
import JavaScriptModuleFiles from "../../../src/JavaScriptModuleFiles.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modules = new JavaScriptModuleFiles(dirname);
const arrowModules = new ArrowModules(modules);

export default arrowModules;
