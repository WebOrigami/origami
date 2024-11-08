import { ObjectTree } from "@weborigami/async-tree";
import builtins from "./builtins.js";

const expanded = { ...builtins };

// For all builtins like `tree:keys`, add a shorthand `keys`.
for (const [key, value] of Object.entries(expanded)) {
  const isNamespace = key.endsWith(":");
  if (isNamespace) {
    for (const [subKey, subValue] of Object.entries(value)) {
      // HACK: Skip description keys until we can make them all non-enumerable.
      if (subKey === "description") {
        continue;
      }
      if (subKey in expanded) {
        throw new Error(`Internal Origami error: Duplicate key: ${subKey}`);
      }
      expanded[subKey] = subValue;
    }
  }
}

export default new ObjectTree(expanded);
