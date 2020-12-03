import { asyncOps, Transform } from "@explorablegraph/core";
import { JavaScriptModuleFiles } from "@explorablegraph/node";
import path from "path";
import { fileURLToPath } from "url";
// import defaultExport from "./commands/defaultExport.js";
// import file from "./commands/file.js";
// import Files from "./commands/Files.js";
// import parse from "./commands/parse.js";
// import serve from "./commands/serve.js";
// import stdin from "./commands/stdin.js";
// import stdout from "./commands/stdout.js";
// import toUpperCase from "./commands/toUpperCase.js";
// import yaml from "./commands/yaml.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesFolder = path.resolve(dirname, "commands");
const modules = new JavaScriptModuleFiles(modulesFolder);

// Commands are modules, where the `foo.js` module becomes the `foo` command.
const commands = new Transform(modules, {
  innerKeyForOuterKey(outerKey) {
    return `${outerKey}.js`;
  },
  outerKeyForInnerKey(innerKey) {
    return path.basename(innerKey, ".js");
  },
});

const structure = await asyncOps.structure(commands);
console.log(structure);

export default commands;

// export default Explorable({
//   ":": defaultExport,
//   Explorable,
//   file,
//   Files,
//   parse,
//   serve,
//   stdin,
//   stdout,
//   toUpperCase,
//   yaml,
// });
