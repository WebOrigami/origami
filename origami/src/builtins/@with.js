import { Tree } from "@graphorigami/core";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import Scope from "../runtime/Scope.js";

/**
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param  {Invocable} invocable
 */
export default function withTree(treelike, invocable) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);
  const fn = toFunction(invocable);
  const scope = new Scope(tree, this);
  return fn.call(scope);
}
