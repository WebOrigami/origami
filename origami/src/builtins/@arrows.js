import { Tree } from "@graphorigami/async-tree";
import { Scope, functionResultsMap } from "@graphorigami/language";
import builtins from "../../src/builtins/@builtins.js";
import arrowFunctionsMap from "../common/arrowFunctionsMap.js";
import { keySymbol } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Interpret arrow keys in the tree as function calls.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function arrows(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    throw TypeError(
      "@arrows requires a treelike argument, but received undefined"
    );
  }
  /** @type {AsyncTree} */
  const tree = Tree.from(treelike);
  const mapped = functionResultsMap(arrowFunctionsMap()(tree));
  const scope = this ?? builtins;
  const scoped = Scope.treeWithScope(mapped, scope);
  scoped[keySymbol] = "@arrows";
  return scoped;
}

arrows.usage = `@arrows <obj>\tInterpret arrow keys in the tree as function calls`;
arrows.documentation = "https://graphorigami.org/language/@arrows.html";
