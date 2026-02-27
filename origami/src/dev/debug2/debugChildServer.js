import { isUnpackable, setParent, Tree } from "@weborigami/async-tree";
import { evaluate, OrigamiFileMap, projectGlobals } from "@weborigami/language";
import debugTransform from "./debugTransform.js";

// So we can distinguish different trees in the debugger
let version = 0;

export default async function debugChildServer(expression, parentPath) {
  // Evaluate the expression
  const parent = new OrigamiFileMap(parentPath);
  const globals = await projectGlobals(parent);
  let maplike = await evaluate(expression, { globals, mode: "shell", parent });

  if (isUnpackable(maplike)) {
    maplike = await maplike.unpack();
  }
  // REVIEW: why did we need this?
  if (maplike instanceof Function) {
    maplike = await maplike();
  }
  if (!Tree.isMaplike(maplike)) {
    return null; // Caller will handle error
  }

  // Set the parent so that Origami debug commands can find things in scope
  setParent(maplike, parent);

  // Add debugging resources
  const merged = debugTransform(maplike);

  /** @type {any} */ (merged).version = version++;

  return merged;
}
