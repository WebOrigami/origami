import { FileTree, ObjectTree } from "@weborigami/async-tree";

let builtinsNew;

// Adapt the existing parent chain to use the new builtins
export default async function jseModeParent(parent) {
  builtinsNew ??= (await import("../builtinsNew.js")).default;
  return cloneParent(parent);
}

function cloneParent(parent) {
  let clone;
  // We expect the parent to be a FileTree (or a subclass), ObjectTree (or a
  // subclass), or builtins.
  if (!parent) {
    return null;
  } else if (parent instanceof FileTree) {
    clone = Reflect.construct(parent.constructor, [parent.path]);
  } else if (parent instanceof ObjectTree) {
    clone = Reflect.construct(parent.constructor, [parent.object]);
  } else if (!parent.parent) {
    // Builtins
    clone = builtinsNew;
  } else {
    // Maybe a map? Skip it and hope for the best.
    return cloneParent(parent.parent);
  }
  clone.parent = cloneParent(parent.parent);
  return clone;
}
