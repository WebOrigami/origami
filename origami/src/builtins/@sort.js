import { sortNatural } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return a new tree with the original's keys sorted in natural sort order.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function sort(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "@sort");
  const sorted = sortNatural()(tree);
  const scoped = Scope.treeWithScope(sorted, this);
  return scoped;
}

sort.usage = `@sort <tree>\tReturn a new tree with the original's keys sorted`;
sort.documentation = "https://weborigami.org/cli/builtins.html#@sort";
