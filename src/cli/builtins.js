import path from "path";
import { fileURLToPath } from "url";
import ExplorableFiles from "../node/ExplorableFiles.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(dirname, "../builtins");
const builtins = new (ImplicitModulesTransform(ExplorableFiles))(
  commandsFolder
);

export default builtins;
