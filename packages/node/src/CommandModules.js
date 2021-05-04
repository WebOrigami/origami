import path from "path";
import { Transform } from "../../core/exports.js";

// CommandModules wraps a graph like JavaScriptModuleFiles.
// The `foo.js` module becomes the `foo` command.
export default class CommandModules extends Transform {
  innerKeyForOuterKey(outerKey) {
    return `${outerKey}.js`;
  }
  outerKeyForInnerKey(innerKey) {
    return path.basename(innerKey, ".js");
  }
  transform(module) {
    return module.default;
  }
}
