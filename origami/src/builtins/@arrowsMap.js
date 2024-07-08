import { functionResultsMap } from "@weborigami/language";
import arrowsMapFn from "../common/arrowsMapFn.js";
import { keySymbol } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";
import builtins from "./@builtins.js";

/**
 * Interpret arrow keys in the tree as function calls.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function arrowsMap(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "arrowsMap");
  const mapped = functionResultsMap(arrowsMapFn()(tree));
  mapped.parent = this ?? builtins;
  mapped[keySymbol] = "@arrowsMap";
  return mapped;
}

arrowsMap.usage = `@arrowsMap <obj>\tInterpret arrow keys in the tree as function calls`;
arrowsMap.documentation = "https://weborigami.org/language/@arrowsMap.html";
