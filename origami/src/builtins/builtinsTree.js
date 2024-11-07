import { ObjectTree } from "@weborigami/async-tree";
import builtins from "./builtins.js";

const expanded = { ...builtins };

// For all builtins like `tree:keys`, add a shorthand `:keys`.
for (const [key, value] of Object.entries(expanded)) {
  const isNamespace = key.endsWith(":");
  if (isNamespace) {
    for (const [subkey, subvalue] of Object.entries(value)) {
      expanded[`:${subkey}`] = subvalue;
    }
  }
}

export default new ObjectTree(expanded);
