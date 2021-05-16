import path from "path";
import { fileURLToPath } from "url";
import VirtualFiles from "../../../src/node/VirtualValuesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-ignore Until we can declare mixins.
export default new VirtualFiles(dirname);
