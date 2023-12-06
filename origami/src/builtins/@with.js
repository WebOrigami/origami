import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
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
