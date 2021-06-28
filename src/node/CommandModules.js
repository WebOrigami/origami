import path from "path";
import Transform from "../../src/common/Transform.js";

// CommandModules wraps a graph like JavaScriptModuleFiles.
// The `foo.js` module becomes the `foo` command.
export default class CommandModules extends Transform {
  async innerKeyForOuterKey(outerKey) {
    return `${outerKey}.js`;
  }

  async outerKeyForInnerKey(innerKey) {
    return path.basename(innerKey, ".js");
  }
}
