import { Tree } from "@weborigami/async-tree";
import { jsGlobals } from "@weborigami/language";

export default function js(...keys) {
  console.warn(
    `Warning: the js:<name> protocol is deprecated. Drop the js: and just use <name> instead.`
  );
  return Tree.traverseOrThrow.call(this, jsGlobals, ...keys);
}
