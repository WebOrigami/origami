import path from "node:path";
import { fileURLToPath } from "node:url";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const loadersFolder = path.resolve(dirname, "../loaders");
/** @type {any} */
const loaders = new (ImplicitModulesTransform(FilesGraph))(loadersFolder);

export default loaders;

loaders.usage = `loaders\tThe default file loaders used by the ori CLI`;
loaders.documentation = "https://graphorigami.org/cli/builtins.html#loaders";
