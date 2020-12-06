import { Transform } from "@explorablegraph/core";
import { JavaScriptModuleFiles } from "@explorablegraph/node";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesFolder = path.resolve(dirname, "commands");
const modules = new JavaScriptModuleFiles(modulesFolder);

// Commands are modules, where the `foo.js` module becomes the `foo` command.
const builtins = new Transform(modules, {
  innerKeyForOuterKey(outerKey) {
    return `${outerKey}.js`;
  },
  outerKeyForInnerKey(innerKey) {
    return path.basename(innerKey, ".js");
  },
  transform(module) {
    return module.default;
  },
});

export default builtins;
