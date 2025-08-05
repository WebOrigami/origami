import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as origami from "./origami/origami.js";
import * as tree from "./tree/tree.js";

let builtins;

export default function builtinsShell() {
  if (!builtins) {
    builtins = {
      // All JSE builtins
      ...builtinsJse(),

      // Dev builtins exposed at the top level in shell
      ...dev,

      Dev: dev,
      Origami: origami,
      Tree: tree,
    };
  }

  return builtins;
}
