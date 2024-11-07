import { ObjectTree } from "@weborigami/async-tree";
import builtins from "./builtins.js";

const expanded = { ...builtins };

// For all builtins like `tree:keys`, add a shorthand `:keys`.
for (const [key, value] of Object.entries(expanded)) {
  const isNamespace = key.endsWith(":");
  if (isNamespace) {
    for (const [subkey, subvalue] of Object.entries(value)) {
      // HACK: Skip description keys until we can make them all non-enumerable.
      if (subkey === "description") {
        continue;
      }
      const colonKey = `:${subkey}`;
      if (colonKey in expanded) {
        throw new Error(`Internal Origami error: Duplicate key: ${colonKey}`);
      }
      expanded[colonKey] = subvalue;
    }
  }
}

export default new ObjectTree(expanded);
