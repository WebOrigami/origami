import { Transform } from "@explorablegraph/core";
import path from "path";

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
