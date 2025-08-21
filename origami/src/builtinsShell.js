import builtinsProgram from "./builtinsProgram.js";
import * as dev from "./dev/dev.js";

let builtins;

export default function builtinsShell() {
  if (!builtins) {
    builtins = {
      // All program builtins
      ...builtinsProgram(),

      // Dev builtins exposed at the top level in shell
      ...dev,
    };
  }

  return builtins;
}
