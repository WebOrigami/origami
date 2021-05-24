import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../../../../src/node/ExplorableFiles.js";
import VirtualValuesMixin from "../../../../src/node/VirtualValuesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-ignore Until we can declare mixins.
export default new (VirtualValuesMixin(ExplorableFiles))(dirname);
