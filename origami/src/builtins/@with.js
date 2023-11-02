import { Tree } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
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
