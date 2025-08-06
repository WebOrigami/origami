import { Tree } from "@weborigami/async-tree";
import { attachWarning, jsGlobals } from "@weborigami/language";

export default async function js(...keys) {
  const result = await Tree.traverseOrThrow.call(this, jsGlobals, ...keys);
  return attachWarning(
    result,
    "The js:<name> protocol is deprecated. Drop the js: and just use <name> instead."
  );
}
