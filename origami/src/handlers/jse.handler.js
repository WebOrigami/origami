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
  // We expect the parent to be a FileTree, ObjectTree, or builtins.
  if (!parent) {
    return null;
  } else if (parent instanceof FileTree) {
    clone = new FileTree(parent.path);
  } else if (parent instanceof ObjectTree) {
    clone = new ObjectTree(parent.object);
  } else if (!parent.parent) {
    // Builtins
    clone = new ObjectTree(builtinsNew);
  }
  clone.parent = cloneParent(parent.parent);
  return clone;
}
