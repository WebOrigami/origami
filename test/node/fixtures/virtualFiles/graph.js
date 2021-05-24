import path from "path";
import { fileURLToPath } from "url";
import Files from "../../../../src/node/Files.js";
import VirtualValuesMixin from "../../../../src/node/VirtualValuesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-ignore Until we can declare mixins.
export default new (VirtualValuesMixin(Files))(dirname);
