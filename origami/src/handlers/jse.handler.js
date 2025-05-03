import { FileTree, ObjectTree } from "@weborigami/async-tree";
// import builtinsNew from "../builtinsNew.js";
import getParent from "./getParent.js";
import oriHandler from "./ori.handler.js";

let builtinsNew;

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    let parent = getParent(packed, options);

    builtinsNew ??= (await import("../builtinsNew.js")).default;

    const newParent = cloneParent(parent);
    if (newParent) {
      parent = newParent;
    }

    return oriHandler.unpack(packed, {
      ...options,
      mode: "jse",
      parent,
    });
  },
};

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
