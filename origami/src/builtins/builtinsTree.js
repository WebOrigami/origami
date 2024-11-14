import { trailingSlash } from "@weborigami/async-tree";
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

// We create our own tree instead of using ObjectTree, since that binds the
// functions would be bound to the object. We want to leave them unbound.
class BuiltinsTree {
  async get(key) {
    const normalizedKey = trailingSlash.remove(key);
    return expanded[normalizedKey];
  }

  async keys() {
    return Object.keys(expanded);
  }
}

export default new BuiltinsTree();
