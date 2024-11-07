// When this is no longer experimental in Node:
// import packageJson from "../../package.json" with { type: "json" };

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helpRegistry from "../common/helpRegistry.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(dirname, "../../package.json");
const buffer = await fs.readFile(packageJsonPath);
const data = JSON.parse(String(buffer));

export default data.version;

helpRegistry.set(
  "origami:version",
  " - Return the version number of the Origami language"
);
