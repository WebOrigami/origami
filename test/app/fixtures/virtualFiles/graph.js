import path from "path";
import { fileURLToPath } from "url";
import VirtualValuesMixin from "../../../../src/app/VirtualValuesMixin.js";
import ExplorableFiles from "../../../../src/node/ExplorableFiles.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-ignore Until we can declare mixins.
export default new (VirtualValuesMixin(ExplorableFiles))(dirname);
