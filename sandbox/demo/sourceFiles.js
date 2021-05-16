import path from "path";
import { fileURLToPath } from "url";
import { Files } from "../../node/exports.js";
import { IndexPages } from "../../web/exports.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.join(dirname, ".");

export default new IndexPages(Files(sourceDirectory));
